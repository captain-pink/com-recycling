import { Maybe } from "graphql-yoga";
import { GraphQLErrorExtensions } from "graphql";

import { ErrorCode } from "../constant";
import { ApiError } from "./api-error.model";

export class InternalServerError extends ApiError {
  constructor(extensions?: Maybe<GraphQLErrorExtensions>) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, "Internal server error", extensions);
  }
}
