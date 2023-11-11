import { Condition } from "dynamoose";

import { DeviceItem } from "..";
import { InternalServerError } from "../../../api/common/model";
import { CompositekeyFilter, DBEntityType } from "../constant";

export class GetDevicesCondition extends Condition {
  constructor(
    deviceItem: Partial<Pick<DeviceItem, "manufacturerId" | "serialNumber">>,
    type = CompositekeyFilter.EQUAL
  ) {
    super();

    const { manufacturerId, serialNumber } = deviceItem;

    if (!manufacturerId) {
      throw new InternalServerError();
    }

    this.where("manufacturerId").eq(manufacturerId);

    if (serialNumber) {
      this.and().where("serialNumber")[type](serialNumber);
    }
  }
}
