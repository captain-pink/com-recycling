import { ArgsType, Field, InputType } from "type-graphql";

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
