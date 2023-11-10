import { Logger } from "winston";

import { Container } from "./container";

const logger = Container.resolve(Logger);

// TODO: create lambda logger to run in aws environment
export function getLogger(): Logger {
  return logger;
}
