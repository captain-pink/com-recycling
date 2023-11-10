import { GraphQLError, GraphQLErrorExtensions } from "graphql";
import { Maybe } from "graphql-yoga";
import { getLogger } from "../../../common/helper";

// TODO: fix stack trace
export class ApiError extends GraphQLError {
  readonly code: string;

  constructor(
    code: string,
    message: string,
    extensions?: Maybe<GraphQLErrorExtensions>
  ) {
    super(
      message,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      extensions
    );

    this.code = code;

    const logger = getLogger();

    logger.error("Api error");
  }
}
