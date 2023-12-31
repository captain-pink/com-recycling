import { Args, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";

import { DeviceService } from "./device.service";
import { AuthScope } from "../../common/constant";
import {
  CreateDevicesArgs,
  CreateDeviceCategoryArgs,
  Device,
  DeviceCategory,
  ManufacturerStats,
  QueryQrArgs,
  RecycleDeviceArgs,
} from "./model";
import { BaseResponse } from "../common/model";
import { QueryDeviceInfoArgs } from "./model/query-device-info-args.model";

@singleton()
@Resolver()
export class DeviceResolver {
  constructor(private readonly deviceService: DeviceService) {}

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Query(() => [Device])
  queryDevices(): Promise<Array<Device>> {
    return this.deviceService.queryDevices();
  }

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Query(() => String)
  queryDeviceRecycleQr(@Args() { serialNumber }: QueryQrArgs) {
    return this.deviceService.generateDeviceQr(serialNumber);
  }

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Query(() => ManufacturerStats)
  queryManufacturerStats() {
    return this.deviceService.queryDeviceStats();
  }

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Mutation(() => BaseResponse)
  createDevicesBatch(
    @Args() { devices }: CreateDevicesArgs
  ): Promise<BaseResponse> {
    return this.deviceService.createDevicesBatch(devices);
  }

  @Query(() => Device)
  queryDeviceInfo(@Args() args: QueryDeviceInfoArgs) {
    return this.deviceService.queryDeviceInfo(args);
  }

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Mutation(() => BaseResponse)
  createDeviceCategory(
    @Args() { category, components, deviceType }: CreateDeviceCategoryArgs
  ): Promise<BaseResponse> {
    return this.deviceService.createDeviceCategory(
      category,
      components,
      deviceType
    );
  }

  @Authorized(AuthScope.WRITE_MANUFACTURER)
  @Query(() => [DeviceCategory])
  queryDeviceCategories() {
    return this.deviceService.queryDeviceCategories();
  }

  @Authorized(AuthScope.WRITE_RECYCLER)
  @Mutation(() => BaseResponse)
  recycleDevice(
    @Args() { manufacturerId, serialNumber }: RecycleDeviceArgs
  ): Promise<BaseResponse> {
    return this.deviceService.recycleDevice(manufacturerId, serialNumber);
  }
}
