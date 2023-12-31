import { Schema } from "dynamoose";

import {
  NumberGreaterThanOrEqual,
  StringLessOrEqual,
  createModel,
} from "../helper";
import { BaseItem } from "./base-item.model";
import { DeviceType } from "../constant";

const componentSchema = new Schema({
  material: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    validate: NumberGreaterThanOrEqual(0),
    required: true,
  },
});

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
      map: "category",
    },
    components: {
      type: Array,
      schema: [componentSchema],
      required: true,
    },
    deviceType: {
      type: String,
      enum: [DeviceType.PHONE, DeviceType.TABLET, DeviceType.LAPTOP],
      required: true,
    },
  },
  { timestamps: true }
);

export class ComponentItem {
  readonly material: string;
  readonly amount: number;
}

export class DeviceCategoryItem extends BaseItem {
  readonly manufacturerId: string;
  readonly category: string;
  readonly deviceType: DeviceType;
  readonly components: Array<ComponentItem>;
}

export const DeviceCategory = createModel<DeviceCategoryItem>(
  "DeviceCategory",
  schema,
  {
    tableName: "Recycling",
  }
);
