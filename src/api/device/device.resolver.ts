import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { singleton } from "tsyringe";

import { DeviceService } from "./device.service";
import { AuthScope } from "../../common/constant";
import {
  CreateDevicesArgs,
  Device,
  GetDeviceInfoArgs,
  ManufacturerStats,
} from "./model";
import { BaseResponse } from "../common/model";

@singleton()
@Resolver()
export class DeviceResolver {
  constructor(private readonly deviceService: DeviceService) {}

  @Query(() => Device)
  getDeviceInfo(@Args() args: GetDeviceInfoArgs) {
    return this.deviceService.getDeviceInfo(args);
  }

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Query(() => ManufacturerStats)
  queryManufacturerStats() {
    return this.deviceService.getDeviceStats();
  }

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Mutation(() => BaseResponse)
  createDevicesBatch(
    @Args() { devices }: CreateDevicesArgs
  ): Promise<BaseResponse> {
    return this.deviceService.createDevicesBatch(devices);
  }
}
