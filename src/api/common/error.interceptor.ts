import { GraphQLError } from "graphql";
import { MiddlewareInterface, NextFn, ResolverData } from "type-graphql";

import { InternalServerError } from "./model";
import { AppContext } from "../../common/type";

// TODO: complete error handling
export class ErrorInterceptor implements MiddlewareInterface<AppContext> {
  async use(_: ResolverData<AppContext>, next: NextFn) {
    try {
      return await next();
    } catch (error) {
      console.error("Error", error);
      if (error instanceof GraphQLError) {
        throw error;
      }

      throw new InternalServerError();
    }
  }
}
