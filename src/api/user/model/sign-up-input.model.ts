import { IsEmail, IsEnum, IsStrongPassword, MaxLength } from "class-validator";
import { Field, InputType } from "type-graphql";

import { UserType } from "../../../db/dynamo/constant";

@InputType()
export class SignUpInput {
  @Field()
  @IsEmail()
  readonly email: string;

  @Field()
  @IsStrongPassword({
    minLength: 10,
    minSymbols: 1,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
  })
  @MaxLength(30)
  readonly password: string;

  @Field(() => UserType)
  @IsEnum(UserType)
  readonly type: UserType;
}
