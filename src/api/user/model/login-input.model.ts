import { MaxLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @Field()
  @MaxLength(30)
  readonly username: string;

  @Field()
  @MaxLength(30)
  readonly passowrd: string;
}
