import { instanceToPlain } from "class-transformer";
import { singleton } from "tsyringe";
import { ModelType } from "dynamoose/dist/General";

import { ModelStore } from "../../common/model";
import { GetDevicesCondition, DeviceItem } from "../../db";
import { StoreModelEntryKey } from "../../common/constant";
import { asBatch } from "../../api/common/helper";
import { BaseSerivce, ApiError } from "../common/model";
import { GetDeviceInfoArgs } from "./model";
import { ErrorCode } from "../common/constant";
import { DeviceInput } from "./model/create-devices-args.model";

@singleton()
export class DeviceService extends BaseSerivce {
  private readonly deviceModel: ModelType<DeviceItem>;

  constructor(
    private readonly modelStore: ModelStore
  ) {
    super();

    this.deviceModel = this.modelStore.get(StoreModelEntryKey.DEVICE);
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
      throw new ApiError(ErrorCode.NOT_FOUND, "The device is not registered in the system");
    }
    return deviceItem;
  }

  async createDevicesBatch(manufacturerId: string, devices: Array<DeviceInput>) {
    const items = devices.map((device: DeviceInput) => {
      return {
        manufacturerId,
        serialNumber: device.serialNumber,
        components: instanceToPlain(device.components)
      };
    });

    return this.replyWithBaseResponse(async () => {
      for (const batch of asBatch(items)) {
        await this.deviceModel.batchPut(batch);
      }
    });
  }
}
