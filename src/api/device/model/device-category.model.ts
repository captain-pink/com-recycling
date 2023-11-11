import { Field, ObjectType } from "type-graphql";
import { Component } from ".";
import { DeviceType } from "../../../db/dynamo/constant";

@ObjectType()
export class DeviceCategory {
  @Field()
  readonly manufacturerId: string;

  @Field()
  readonly category: string;

  @Field()
  readonly deviceType: DeviceType;

  @Field(() => [Component])
  readonly components: Array<Component>;
}
