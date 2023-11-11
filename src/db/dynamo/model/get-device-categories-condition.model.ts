import { Condition } from "dynamoose";

import { DeviceCategoryItem } from "./device-category.model";
import { InternalServerError } from "../../../api/common/model";
import { CompositekeyFilter } from "../constant";

export class GetDeviceCategoriesCondition extends Condition {
  constructor(
	deviceCategoryItem: Partial<Pick<DeviceCategoryItem, "manufacturerId">>,
	type = CompositekeyFilter.EQUAL
  ) {
	super();

	const { manufacturerId } = deviceCategoryItem;

	if (!manufacturerId) {
	  throw new InternalServerError();
	}

	this.where("manufacturerId").eq(manufacturerId);
  }
}
