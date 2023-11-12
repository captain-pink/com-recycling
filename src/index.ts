import { aws } from "dynamoose";
import cors from "@elysiajs/cors";

import { bootstrap } from "./app";
import { ConfigEntries } from "./common/constant";
import { ConfigService } from "./common/service";
import { ApplicationConfig } from "./common/type";
import { Container } from "./common/container";

aws.ddb.local();

const app = await bootstrap();

const configService =
  Container.resolve<ConfigService<ApplicationConfig>>(ConfigService);
const systemConfig = configService.get(ConfigEntries.SYSTEM);

app
  .use(
    cors({
      origin: systemConfig.domain,
      credentials: true,
      allowedHeaders: ["content-type", "accept", "origin", "user-Agent"],
    })
  )
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
