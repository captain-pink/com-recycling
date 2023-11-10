import { Condition } from "dynamoose";

import { UserItem } from "..";
import { InternalServerError } from "../../../api/common/model";
import { CompositekeyFilter } from "../constant";

export class GetUsersCondition extends Condition {
  constructor(
    userItem: Partial<Pick<UserItem, "type" | "username">>,
    type = CompositekeyFilter.EQUAL
  ) {
    super();

    const { type: modelType, username } = userItem;

    if (!modelType) {
      throw new InternalServerError();
    }

    this.where("type").eq(modelType);

    if (username) {
      this.and().where("username")[type](username);
    }
  }
}
