import { MaxLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @Field()
  @MaxLength(30)
  readonly email: string;

  @Field()
  @MaxLength(30)
  readonly password: string;
}
