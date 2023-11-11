import { MaxLength } from "class-validator";
import { ArgsType, Field, InputType } from "type-graphql";
import { Component } from ".";


@InputType()
export class DeviceInput {
  @Field()
  readonly serialNumber: string;
  
  @Field(() => [Component])
  readonly components: Array<any>;
}

@ArgsType()
export class CreateDevicesArgs {
  @Field()
  @MaxLength(30)
  readonly manufacturerId: string;

  @Field(() => [DeviceInput])
  readonly devices: Array<any>;
}