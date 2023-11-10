import { container } from "tsyringe";
import { Logger, createLogger, transports, format } from "winston";

import { InjectionToken } from "./constant";
import { type ApplicationConfig } from "./type";
import config from "../../.config/config-local.json";

container.register<ApplicationConfig>(InjectionToken.APPLICATION_CONFIG, {
  useValue: config,
});

const { combine, timestamp, prettyPrint, colorize, errors } = format;

container.register<Logger>(Logger, {
  useValue: createLogger({
    level: "info",
    format: combine(
      errors({ stack: true }),
      colorize(),
      timestamp(),
      prettyPrint()
    ),
    transports: [new transports.Console()],
  }),
});

export const Container = container;
