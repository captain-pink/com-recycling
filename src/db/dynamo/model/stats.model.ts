import { Schema } from "dynamoose";

import {
  NumberGreaterThanOrEqual,
  StringLessOrEqual,
  createModel,
} from "../helper";
import { BaseItem } from "..";
import { DBEntityType } from "../constant";

const schema = new Schema({
  pk: {
    type: String,
    hashKey: true,
    validate: StringLessOrEqual(50),
    required: true,
    map: "manufacturerId",
  },
  sk: {
    type: String,
    enum: [DBEntityType.STATS],
    default: DBEntityType.STATS,
    required: true,
    rangeKey: true,
  },
  total: {
    type: Number,
    validate: NumberGreaterThanOrEqual(0),
    default: 0,
  },
  recycled: {
    type: Number,
    validate: NumberGreaterThanOrEqual(0),
    default: 0,
  },
  totalRawWeight: {
    type: Number,
    validate: NumberGreaterThanOrEqual(0),
    default: 0,
  },
});

export class StatsItem extends BaseItem {
  readonly manufacturerId: string;
  readonly entityType: string;
  readonly total: number;
  readonly recycled: number;
  readonly totalRawWeight: number;
}

export const Stats = createModel<StatsItem>("Stats", schema, {
  tableName: "Recycling",
});
