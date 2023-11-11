import { Schema } from "dynamoose";

import { StringLessOrEqual, createModel } from "../helper";
import { BaseItem } from "./base-item.model";

const schema = new Schema(
    {
      pk: {
        type: String,
        hashKey: true,
        required: true,
        map: "manufacturerId",
      },
      sk: {
        type: String,
        validate: StringLessOrEqual(30),
        required: true,
        rangeKey: true,
        map: "serialNumber",
      },
      category: {
        type: String,
        required: true,
      },
      recycled: {
        type: Boolean,
        default: false,
        required: true,
      },
    },
    { timestamps: true }
);

export class DeviceItem extends BaseItem {
    readonly manufacturerId: string;
    readonly serialNumber: string;
    readonly category: string;
    readonly recycled: boolean;
}

export const Device = createModel<DeviceItem>("Device", schema, {
  tableName: "Recycling",
});
