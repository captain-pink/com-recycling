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
} from "../../db";
import {
  AsyncStorageEntries,
  ConfigEntries,
  StoreModelEntryKey,
} from "../../common/constant";
import { asBatch } from "../../api/common/helper";
import { BaseSerivce, NotFoundError } from "../common/model";
import { Device, ManufacturerStats, QueryDeviceInfoArgs } from "./model";
import { DeviceInput } from "./model/create-devices-args.model";
import { Component } from "./model/device.model";
import {
  AsyncStorageService,
  ConfigService,
  QrService,
} from "../../common/service";
import { StatsItem } from "../../db/dynamo/model/stats.model";
import { DBEntityType } from "../../db/dynamo/constant";
import { ComponentItem } from "../../db/dynamo/model/device-category.model";
import { SystemConfig } from "../../common/type";

@singleton()
export class DeviceService extends BaseSerivce {
  private readonly deviceModel: ModelType<DeviceItem>;
  private readonly deviceCategoryModel: ModelType<DeviceCategoryItem>;
  private readonly statsModel: ModelType<StatsItem>;
  private readonly systemConfig: SystemConfig;

  constructor(
    private readonly modelStore: ModelStore,
    private readonly asyncStorageService: AsyncStorageService,
    private readonly qrService: QrService,
    private readonly configService: ConfigService
  ) {
    super();

    this.deviceModel = this.modelStore.get(StoreModelEntryKey.DEVICE);
    this.deviceCategoryModel = this.modelStore.get(
      StoreModelEntryKey.DEVICE_CATEGORY
    );
    this.statsModel = this.modelStore.get(StoreModelEntryKey.STATS);
    this.systemConfig = this.configService.get(ConfigEntries.SYSTEM);
  }

  async createDeviceCategory(category: string, components: Array<Component>) {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    return this.replyWithBaseResponse(async () => {
      await this.deviceCategoryModel.create({
        manufacturerId,
        category,
        components: instanceToPlain(components) as Array<ComponentItem>,
      });
    });
  }

  async queryDeviceCategories() {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    const categories = await this.deviceCategoryModel
      .query(
        new GetDeviceCategoriesCondition({
          manufacturerId,
        })
      )
      .exec();

    return categories;
  }

  async queryDeviceInfo(input: QueryDeviceInfoArgs) {
    const deviceItem = await this.getDeviceItem(input);

    if (!deviceItem) {
      throw new NotFoundError();
    }

    const [category] = await this.deviceCategoryModel
      .query(
        new GetDeviceCategoriesCondition({
          manufacturerId: input.manufacturerId,
          category: deviceItem.category,
        })
      )
      .exec();

    return {
      manufacturerId: deviceItem.manufacturerId,
      serialNumber: deviceItem.serialNumber,
      category: deviceItem.category,
      components: category.components,
      isRecycled: deviceItem.isRecycled,
    };
  }

  async generateDeviceQr(serialNumber: string) {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    );

    const deviceItem = await this.getDeviceItem({
      manufacturerId,
      serialNumber,
    });

    if (!deviceItem) {
      throw new NotFoundError();
    }
    const url = `${this.systemConfig.domain}/recycle/${manufacturerId}/${deviceItem.serialNumber}`;

    return this.qrService.generateQrCode(url);
  }

  private async getDeviceItem(input: QueryDeviceInfoArgs) {
    const [deviceItem] = await this.deviceModel
      .query(
        new GetDevicesCondition({
          manufacturerId: input.manufacturerId,
          serialNumber: input.serialNumber,
        })
      )
      .exec();

    return deviceItem;
  }

  // TODO: To add error handling for unprocessed items
  async createDevicesBatch(devices: Array<DeviceInput>) {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    const items = devices.map((device: DeviceInput) => {
      return {
        manufacturerId,
        serialNumber: device.serialNumber,
        category: device.category,
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
      .query(new GetDevicesCondition({ manufacturerId }))
      .exec();

    return deviceItems.map((item: DeviceItem) => plainToInstance(Device, item));
  }
}
