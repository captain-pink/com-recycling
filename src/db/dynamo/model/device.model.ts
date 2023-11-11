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
      validate: StringLessOrEqual(100),
      required: true,
      rangeKey: true,
      map: "serialNumber",
    },
    category: {
      type: String,
      required: true,
    },
    isRecycled: {
      type: Boolean,
      default: false,
      required: true,
    },
    recycledBy: {
      type: String,
    },
  },
  { timestamps: true }
);

export class DeviceItem extends BaseItem {
  readonly manufacturerId: string;
  readonly serialNumber: string;
  readonly category: string;
  readonly isRecycled: boolean;
  readonly recycledBy: string;
}

export const Device = createModel<DeviceItem>("Device", schema, {
  tableName: "Recycling",
});
