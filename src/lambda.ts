import "./lambda-preload";

import { bootstrap } from "./app";

const app = await bootstrap();

// TODO: fix ReflectMetadata info
export default {
  fetch(request: Request) {
    return app.handle(request);
  },
};
