import { MaxLength } from "class-validator";
import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class QueryQrArgs {
  @Field()
  @MaxLength(100)
  readonly serialNumber: string;
}
