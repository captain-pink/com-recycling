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
import { AsyncStorageService, ConfigService } from "./common/service";
import { ApplicationConfig } from "./common/type";
import { ConfigEntries } from "./common/constant";

if (process.env.NODE_ENV === "prod") {
  aws.ddb.set(new aws.ddb.DynamoDB({ region: process.env.region }));
} else {
  aws.ddb.local();
}

export async function bootstrap() {
  const configService =
    Container.resolve<ConfigService<ApplicationConfig>>(ConfigService);
  const systemConfig = configService.get(ConfigEntries.SYSTEM);

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
    graphiql: systemConfig.graphiql,
    plugins: [useCookies()],
  });

  return new Elysia()
    .use(
      cors({
        origin: systemConfig.domain,
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
