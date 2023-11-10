import { Field, ObjectType } from "type-graphql";

import { ResponseStatus } from "../constant";

// TODO: add details in case there is validation error or smth
@ObjectType()
export class BaseResponse {
  @Field()
  status: string;

  constructor(status: ResponseStatus) {
    this.status = status;
  }
}
