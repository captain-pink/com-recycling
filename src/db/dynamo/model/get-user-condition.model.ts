import { Condition } from "dynamoose";

import { UserItem } from "..";
import { InternalServerError } from "../../../api/common/model";
import { CompositekeyFilter } from "../constant";

export class GetUsersCondition extends Condition {
  constructor(
    userItem: Partial<Pick<UserItem, "entityType" | "email">>,
    type = CompositekeyFilter.EQUAL
  ) {
    super();

    const { entityType, email } = userItem;

    if (!entityType) {
      throw new InternalServerError();
    }

    this.where("entityType").eq(entityType);

    if (email) {
      this.and().where("email")[type](email);
    }
  }
}
