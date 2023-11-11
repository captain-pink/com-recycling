import { bootstrap } from "./app";

const app = await bootstrap();

app.listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
