import Elysia from "elysia";
import cors from "@elysiajs/cors";
import { createYoga } from "graphql-yoga";
import { buildSchema } from "type-graphql";
import { aws } from "dynamoose";
import { useCookies } from "@whatwg-node/server-plugin-cookies";

import {
  ErrorInterceptor,
  AuthCheckerService,
  UserResolver,
  ElysiaYogaPlugin,
  DeviceResolver,
} from "./api";
import { Container } from "./common/container";
import { AsyncStorageService } from "./common/service";

aws.ddb.local();

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [DeviceResolver, UserResolver],
    container: { get: Container.resolve.bind(Container) },
    globalMiddlewares: [ErrorInterceptor],
    authChecker: AuthCheckerService,
    validate: true,
  });

  const yoga = createYoga({
    schema,
    cors: false,
    plugins: [useCookies()],
  });

  return new Elysia()
    .use(
      cors({
        origin: "localhost:5173",
        credentials: true,
        allowedHeaders: ["content-type", "accept", "origin", "user-Agent"],
      })
    )
    .use(
      ElysiaYogaPlugin({
        yoga,
        asyncStorageSerivce: Container.resolve(AsyncStorageService),
      })
    );
}

const app = await bootstrap();

app.listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
