import { Condition } from "dynamoose";

import { UserItem } from "..";
import { InternalServerError } from "../../../api/common/model";
import { CompositekeyFilter } from "../constant";

export class GetUsersCondition extends Condition {
  constructor(
    userItem: Partial<Pick<UserItem, "entityType" | "email" | "userId">>,
    type = CompositekeyFilter.EQUAL
  ) {
    super();

    const { entityType, email, userId } = userItem;

    if (!entityType) {
      throw new InternalServerError();
    }

    this.where("entityType").eq(entityType);

    if (email) {
      this.and().where("email")[type](email);
    }

    if (userId) {
      this.and().where("userId").eq(userId);
    }
  }
}
