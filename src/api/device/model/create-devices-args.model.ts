import { MaxLength } from "class-validator";
import { ArgsType, Field, InputType } from "type-graphql";
import { Component } from ".";

@InputType()
export class DeviceInput {
  @Field()
  readonly serialNumber: string;

  @Field()
  readonly category: string;  
}

@ArgsType()
export class CreateDevicesArgs {
  @Field(() => [DeviceInput])
  readonly devices: Array<DeviceInput>;
}
