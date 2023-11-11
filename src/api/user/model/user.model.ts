import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field()
  readonly userId: string;

  @Field()
  readonly companyName: string;
}