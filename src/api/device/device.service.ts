import { instanceToPlain } from "class-transformer";
import { singleton } from "tsyringe";
import { ModelType } from "dynamoose/dist/General";
import { plainToInstance } from "class-transformer";

import { JwtPayload, ModelStore } from "../../common/model";
import { GetDevicesCondition, DeviceItem } from "../../db";
import { AsyncStorageEntries, StoreModelEntryKey } from "../../common/constant";
import { asBatch } from "../../api/common/helper";
import { BaseSerivce, ApiError } from "../common/model";
import { GetDeviceInfoArgs, ManufacturerStats } from "./model";
import { ErrorCode } from "../common/constant";
import { DeviceInput } from "./model/create-devices-args.model";
import { AsyncStorageService } from "../../common/service";
import { StatsItem } from "../../db/dynamo/model/stats.model";
import { DBEntityType } from "../../db/dynamo/constant";

@singleton()
export class DeviceService extends BaseSerivce {
  private readonly deviceModel: ModelType<DeviceItem>;
  private readonly statsModel: ModelType<StatsItem>;

  constructor(
    private readonly modelStore: ModelStore,
    private readonly asyncStorageService: AsyncStorageService
  ) {
    super();

    this.deviceModel = this.modelStore.get(StoreModelEntryKey.DEVICE);
    this.statsModel = this.modelStore.get(StoreModelEntryKey.STATS);
  }

  async getDeviceInfo(input: GetDeviceInfoArgs) {
    const [deviceItem] = await this.deviceModel
      .query(
        new GetDevicesCondition({
          manufacturerId: input.manufacturerId,
          serialNumber: input.serialNumber,
        })
      )
      .exec();

    if (!deviceItem) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        "The device is not registered in the system"
      );
    }

    return deviceItem;
  }

  // TODO: To add error handling for unprocessed items
  async createDevicesBatch(
    manufacturerId: string,
    devices: Array<DeviceInput>
  ) {
    const items = devices.map((device: DeviceInput) => {
      return {
        manufacturerId,
        serialNumber: device.serialNumber,
        components: instanceToPlain(device.components),
      };
    });

    return this.replyWithBaseResponse(async () => {
      for (const batch of asBatch(items)) {
        await this.deviceModel.batchPut(batch);
      }

      const { id: manufacturerId } = this.asyncStorageService.get(
        AsyncStorageEntries.JWT_PAYLOAD
      ) as JwtPayload;

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

  async getDeviceStats(): Promise<ManufacturerStats> {
    const { id: manufacturerId } = this.asyncStorageService.get(
      AsyncStorageEntries.JWT_PAYLOAD
    ) as JwtPayload;

    const stats = await this.statsModel.get({
      manufacturerId,
      sk: DBEntityType.STATS,
    });

    return plainToInstance(ManufacturerStats, stats.toJSON());
  }
}
