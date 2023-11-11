import { aws } from "dynamoose";

import { bootstrap } from "./app";

aws.ddb.local();

const app = await bootstrap();

app.listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
