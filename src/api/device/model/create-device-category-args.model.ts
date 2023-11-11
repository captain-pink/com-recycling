import { ArgsType, Field } from "type-graphql";

import { Component } from ".";
import { DeviceType } from "../../../db/dynamo/constant";

@ArgsType()
export class CreateDeviceCategoryArgs {
  @Field()
  readonly category: string;

  @Field(() => [Component])
  readonly components: Array<Component>;

  @Field(() => DeviceType)
  readonly deviceType: DeviceType;
}
