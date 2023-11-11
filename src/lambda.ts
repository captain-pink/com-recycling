import { bootstrap } from "./app";

const app = await bootstrap();

export default {
  fetch(request: Request) {
    return app.handle(request);
  },
};
