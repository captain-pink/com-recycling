import { MaxLength } from "class-validator";
import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class GetDeviceInfoArgs {
  @Field()
  @MaxLength(30)
  readonly manufacturerId: string;

  @Field()
  @MaxLength(30)
  readonly serialNumber: string;
}
