import { IsStrongPassword, MaxLength, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class SignUpInput {
  @Field()
  @MinLength(5)
  @MaxLength(30)
  readonly username: string;

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
}
