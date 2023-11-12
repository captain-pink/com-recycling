import { instanceToPlain } from "class-transformer";
import { singleton } from "tsyringe";
import { ModelType } from "dynamoose/dist/General";
import { plainToInstance } from "class-transformer";

import { JwtPayload, ModelStore } from "../../common/model";
import {
  GetDevicesCondition,
  DeviceItem,
  DeviceCategoryItem,
  GetDeviceCategoriesCondition,
  GetUsersCondition,
  UserItem,
} from "../../db";
import {
  AsyncStorageEntries,
  ConfigEntries,
  StoreModelEntryKey,
} from "../../common/constant";
import { asBatch } from "../../api/common/helper";
import { ApiError, BaseSerivce, NotFoundError } from "../common/model";
import {
  Device,
  DeviceCategory,
  ManufacturerStats,
  QueryDeviceInfoArgs,
} from "./model";
import { DeviceInput } from "./model/create-devices-args.model";
import { Component } from "./model/device.model";
import {
  AsyncStorageService,
  ConfigService,
  QrService,
} from "../../common/service";
import { StatsItem } from "../../db/dynamo/model/stats.model";
import {
  CompositekeyFilter,
  DBEntityType,
  DeviceType,
} from "../../db/dynamo/constant";
import { ComponentItem } from "../../db/dynamo/model/device-category.model";
import { SystemConfig, MaterialsConfig } from "../../common/type";
import { ErrorCode } from "../common/constant";

@singleton()
export class DeviceService extends BaseSerivce {
  private readonly userModel: ModelType<UserItem>;
  private readonly deviceModel: ModelType<DeviceItem>;
  private readonly deviceCategoryModel: ModelType<DeviceCategoryItem>;
  private readonly statsModel: ModelType<StatsItem>;
  private readonly systemConfig: SystemConfig;
  private readonly materialsConfig: MaterialsConfig;

  constructor(
    private readonly modelStore: ModelStore,
    private readonly asyncStorageService: AsyncStorageService,
    private readonly qrService: QrService,
    private readonly configService: ConfigService
  ) {
    super();

    this.userModel = this.modelStore.get(StoreModelEntryKey.USER);
    this.deviceModel = this.modelStore.get(StoreModelEntryKey.DEVICE);
    this.deviceCategoryModel = this.modelStore.get(
      StoreModelEntryKey.DEVICE_CATEGORY
    );
    this.statsModel = this.modelStore.get(StoreModelEntryKey.STATS);
    this.systemConfig = this.configService.get(ConfigEntries.SYSTEM);
    this.materialsConfig = this.configService.get(ConfigEntries.MATERIALS);
  }

  async createDeviceCategory(
    category: string,
    components: Array<Component>,
    deviceType: DeviceType
  ) {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    return this.replyWithBaseResponse(async () => {
      await this.deviceCategoryModel.create({
        manufacturerId,
        category: `${DBEntityType.CATEGORY}_${category}`,
        components: instanceToPlain(components) as Array<ComponentItem>,
        deviceType,
      });
    });
  }

  async queryDeviceCategories(): Promise<Array<DeviceCategory>> {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    const categories = await this.deviceCategoryModel
      .query(
        new GetDeviceCategoriesCondition(
          {
            manufacturerId,
            category: `${DBEntityType.CATEGORY}_`,
          },
          CompositekeyFilter.BEGINS_WITH
        )
      )
      .exec();

    return categories.map(
      ({ manufacturerId, category, components, deviceType }) => {
        return {
          manufacturerId: manufacturerId,
          category: category.split("_")[1],
          components: plainToInstance(ComponentItem, components),
          deviceType,
        };
      }
    );
  }

  async queryDeviceInfo(input: QueryDeviceInfoArgs) {
    const deviceItem = await this.getDeviceItem(input);

    const [category] = await this.deviceCategoryModel
      .query(
        new GetDeviceCategoriesCondition({
          manufacturerId: input.manufacturerId,
          category: `${DBEntityType.CATEGORY}_${deviceItem.category}`,
        })
      )
      .exec();

    return {
      manufacturerId: deviceItem.manufacturerId,
      serialNumber: deviceItem.serialNumber,
      category: deviceItem.category,
      deviceType: category.deviceType,
      components: category.components,
      isRecycled: deviceItem.isRecycled,
      recycledBy: deviceItem.recycledBy,
      totalCost: this.calculateTotalCost(category.components)
    };
  }

  private calculateTotalCost(components: Array<ComponentItem>) {
    let m = new Map<string, number>(Object.entries(this.materialsConfig.material_costs));
    return (components
      .map((component: ComponentItem) => {
      return component.amount * m.get(component.material)!;
      })
      .reduce((sum, current) => sum + current, 0) / 1000).toFixed(2);
  }

  async generateDeviceQr(serialNumber: string) {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    );

    const deviceItem = await this.getDeviceItem({
      manufacturerId,
      serialNumber,
    });

    const url = `${this.systemConfig.domain}/recycle/${manufacturerId}/${deviceItem.serialNumber}`;

    return this.qrService.generateQrCode(url);
  }

  private async getDeviceItem({
    manufacturerId,
    serialNumber,
  }: QueryDeviceInfoArgs) {
    const [deviceItem] = await this.deviceModel
      .query(
        new GetDevicesCondition({
          manufacturerId: manufacturerId,
          serialNumber: `${DBEntityType.SERIAL_NUMBER}_${serialNumber}`,
        })
      )
      .exec();

    if (!deviceItem) {
      throw new NotFoundError();
    }

    return {
      manufacturerId: deviceItem.manufacturerId,
      serialNumber: deviceItem.serialNumber.split("_")[1],
      category: deviceItem.category.split("_")[1],
      isRecycled: deviceItem.isRecycled,
      recycledBy: deviceItem.recycledBy,
    };
  }

  // TODO: To add error handling for unprocessed items
  async createDevicesBatch(devices: Array<DeviceInput>) {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    const items = devices.map((device: DeviceInput) => {
      return {
        manufacturerId,
        serialNumber: `${DBEntityType.SERIAL_NUMBER}_${device.serialNumber}`,
        category: `${DBEntityType.CATEGORY}_${device.category}`,
        isRecycled: false,
      };
    });

    return this.replyWithBaseResponse(async () => {
      for (const batch of asBatch(items)) {
        await this.deviceModel.batchPut(batch);
      }

      const stats = await this.statsModel.get({
        manufacturerId,
        sk: DBEntityType.STATS,
      });

      await this.statsModel.update({
        manufacturerId,
        sk: DBEntityType.STATS,
        total: stats.total + items.length,
      });
    });
  }

  async queryDeviceStats(): Promise<ManufacturerStats> {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    const stats = await this.statsModel.get({
      manufacturerId,
      sk: DBEntityType.STATS,
    });

    return plainToInstance(ManufacturerStats, stats.toJSON());
  }

  async queryDevices() {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    const deviceItems = await this.deviceModel
      .query(
        new GetDevicesCondition(
          { manufacturerId, serialNumber: `${DBEntityType.SERIAL_NUMBER}_` },
          CompositekeyFilter.BEGINS_WITH
        )
      )
      .exec();

    return deviceItems.map((item: DeviceItem) => {
      return {
        manufacturerId: item.manufacturerId,
        serialNumber: item.serialNumber.split("_")[1],
        category: item.category.split("_")[1],
        isRecycled: item.isRecycled,
        recycledBy: item.recycledBy,
      };
    });
  }

  async recycleDevice(manufacturerId: string, serialNumber: string) {
    const { id: recyclerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    return this.replyWithBaseResponse(async () => {
      const deviceItem = await this.getDeviceItem({
        manufacturerId,
        serialNumber,
      });

      if (deviceItem.isRecycled) {
        return new ApiError(
          ErrorCode.INVALID_ARGUMENT,
          "Device is already recycled"
        );
      }

      const [recycler] = await this.userModel
        .query(
          new GetUsersCondition({
            entityType: DBEntityType.USER,
            userId: recyclerId,
          })
        )
        .exec();

      if (!recycler) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Recycler is not found"
        );
      }

      const stats = await this.statsModel.get({
        manufacturerId,
        sk: DBEntityType.STATS,
      });

      await this.statsModel.update({
        manufacturerId,
        sk: DBEntityType.STATS,
        total: stats.total,
        recycled: stats.recycled + 1,
        totalRawWeight: stats.totalRawWeight + 44.21,
      });

      await this.deviceModel.update({
        manufacturerId,
        serialNumber: `${DBEntityType.SERIAL_NUMBER}_${serialNumber}`,
        isRecycled: true,
        recycledBy: recycler.companyName,
      });
    });
  }
}
