import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class LoggedIn {
  @Field()
  readonly token: string;

  readonly expires: number;
}
