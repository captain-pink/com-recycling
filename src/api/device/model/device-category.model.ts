import { Field, ObjectType, InputType } from "type-graphql";
import { Component } from ".";

@ObjectType()
export class DeviceCategory {
  @Field()
  readonly manufacturerId: string;

  @Field()
  readonly category: string;

  @Field(() => [Component])
  readonly components: Array<Component>;
}