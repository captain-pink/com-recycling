import { Condition } from "dynamoose";

import { DeviceCategoryItem } from "./device-category.model";
import { InternalServerError } from "../../../api/common/model";
import { CompositekeyFilter, DBEntityType } from "../constant";

export class GetDeviceCategoriesCondition extends Condition {
  constructor(
    deviceCategoryItem: Partial<
      Pick<DeviceCategoryItem, "manufacturerId" | "category">
    >,
    type = CompositekeyFilter.EQUAL
  ) {
    super();

    const { manufacturerId, category } = deviceCategoryItem;

    if (!manufacturerId) {
      throw new InternalServerError();
    }

    this.where("manufacturerId").eq(manufacturerId);

    if (category) {
      this.and().where("category")[type](category);
    }
  }
}
