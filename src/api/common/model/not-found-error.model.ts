import { Maybe } from "graphql-yoga";
import { GraphQLErrorExtensions } from "graphql";

import { ErrorCode } from "../constant";
import { ApiError } from "./api-error.model";

export class NotFoundError extends ApiError {
  constructor(extensions?: Maybe<GraphQLErrorExtensions>) {
    super(ErrorCode.NOT_FOUND, "Failed to find item", extensions);
  }
}
