import { ConfigEntries } from "./constant";

export type JwtConfig = {
  readonly secret: string;
  readonly expHours: number;
};

export type AuthConfig = {
  readonly token: string;
  readonly hashingCost: number;
  readonly throttleLogin: number;
  readonly jwt: JwtConfig;
};

export type SystemConfig = {};

export type ApplicationConfig = {
  readonly [ConfigEntries.SYSTEM]: SystemConfig;
  readonly [ConfigEntries.AUTH]: AuthConfig;
};

export type AppContext = {
  readonly request: Request;
};
