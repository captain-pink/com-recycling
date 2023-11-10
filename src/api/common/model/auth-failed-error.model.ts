import { Maybe } from "graphql-yoga";
import { GraphQLErrorExtensions } from "graphql";

import { ErrorCode } from "../constant";
import { ApiError } from "./api-error.model";

export class AuthFailedError extends ApiError {
  constructor(extensions?: Maybe<GraphQLErrorExtensions>) {
    super(
      ErrorCode.FAILED,
      "Failed to authorize. Check 'username' or 'password'",
      extensions
    );
  }
}
