import Elysia from "elysia";
import { YogaServerInstance } from "graphql-yoga";

import { AsyncStorageService } from "../../../common/service";

export function ElysiaYogaPlugin({
  yoga,
  asyncStorageSerivce,
}: {
  yoga: YogaServerInstance<{}, {}>;
  asyncStorageSerivce: AsyncStorageService;
}) {
  return (app: Elysia) => {
    return app
      .get("/graphql", ({ request }) => yoga.fetch(request))
      .post(
        "/graphql",
        ({ request }) => {
          return asyncStorageSerivce.run(() => yoga.fetch(request));
        },
        {
          type: "none",
        }
      );
  };
}
