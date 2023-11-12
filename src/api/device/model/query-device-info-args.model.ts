import { MaxLength } from "class-validator";
import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class QueryDeviceInfoArgs {
  @Field()
  @MaxLength(100)
  readonly manufacturerId: string;

  @Field()
  @MaxLength(100)
  readonly serialNumber: string;
}
