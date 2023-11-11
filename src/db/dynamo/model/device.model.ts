import { Schema } from "dynamoose";

import {
  NumberGreaterThanOrEqual,
  StringLessOrEqual,
  createModel,
} from "../helper";
import { BaseItem } from "./base-item.model";
import { IndexType } from "dynamoose/dist/Schema";

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
      map: "serialNumber",
    },
    recycled: {
      type: Boolean,
      default: false,
      required: true,
    },
    components: {
      type: Array,
      schema: [componentSchema],
      required: true,
    },
  },
  { timestamps: true }
);

export class ComponentItem {
  readonly material: string;
  readonly amount: number;
}

export class DeviceItem extends BaseItem {
  readonly manufacturerId: string;
  readonly serialNumber: string;
  readonly components: Array<ComponentItem>;
  readonly recycled: boolean;
}

export const Device = createModel<DeviceItem>("Device", schema, {
  tableName: "Recycling",
});
