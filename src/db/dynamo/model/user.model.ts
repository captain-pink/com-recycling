import { Schema } from "dynamoose";

import { StringLessOrEqual, createModel } from "../helper";
import { DBEntityType } from "../constant";
import { BaseItem } from "./base-item.model";

const schema = new Schema(
  {
    pk: {
      type: String,
      default: DBEntityType.USER,
      hashKey: true,
      required: true,
      map: "type",
    },
    sk: {
      type: String,
      validate: StringLessOrEqual(30),
      required: true,
      rangeKey: true,
      map: "username",
    },
    hash: {
      type: String,
      validate: StringLessOrEqual(100),
      required: true,
    },
    scopes: {
      type: Array,
      schema: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

export class UserItem extends BaseItem {
  // constant USER
  readonly type: string;
  readonly username: string;
  readonly hash: string;
  readonly scopes: Array<number>;
}

export const User = createModel<UserItem>("User", schema, {
  tableName: "Table",
});
