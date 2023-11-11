import { MaxLength } from "class-validator";
import { ArgsType, Field, InputType } from "type-graphql";
import { Component } from ".";

@ArgsType()
export class CreateDeviceCategoryArgs {
  @Field()
  readonly category: string;

  @Field(() => [Component])
  readonly components: Array<Component>;
}
