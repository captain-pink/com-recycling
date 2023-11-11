import { IsEnum, MaxLength } from "class-validator";
import { ArgsType, Field } from "type-graphql";
import { UserType } from "../../../db/dynamo/constant";

@ArgsType()
export class QueryUsersArgs {
  @Field()
  @IsEnum(UserType)
  readonly userType: UserType;
}
