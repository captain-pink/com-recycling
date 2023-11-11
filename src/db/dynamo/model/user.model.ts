import { Schema } from "dynamoose";
import { IndexType } from "dynamoose/dist/Schema";

import { StringLessOrEqual, createModel } from "../helper";
import { DBEntityType, UserType } from "../constant";
import { BaseItem } from "./base-item.model";

const schema = new Schema(
  {
    pk: {
      type: String,
      default: DBEntityType.USER,
      hashKey: true,
      required: true,
      map: "entityType",
    },
    sk: {
      type: String,
      validate: StringLessOrEqual(30),
      required: true,
      rangeKey: true,
      map: "email",
    },
    companyName: {
      type: String,
      validate: StringLessOrEqual(150),
      required: true,
    },
    hash: {
      type: String,
      validate: StringLessOrEqual(100),
      required: true,
    },
    type: {
      type: Number,
      enum: [UserType.MANUFACTURER, UserType.RECYCLER],
      required: true,
    },
    userId: {
      type: String,
      validate: StringLessOrEqual(50),
      required: true,
      index: { type: IndexType.local, name: "userIdIndex" },
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
  readonly entityType: string;
  readonly email: string;
  readonly companyName: string;
  readonly hash: string;
  readonly type: UserType;
  readonly scopes: Array<number>;
  // unique user id
  readonly userId: string;
}

export const User = createModel<UserItem>("User", schema, {
  tableName: "Recycling",
});
