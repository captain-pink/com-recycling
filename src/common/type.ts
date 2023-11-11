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

export type SystemConfig = {
  readonly domain: string;
};

export type MaterialsConfig = {
  readonly material_costs: Map<string, number>;
};

export type ApplicationConfig = {
  readonly [ConfigEntries.SYSTEM]: SystemConfig;
  readonly [ConfigEntries.AUTH]: AuthConfig;
  readonly [ConfigEntries.MATERIALS]: MaterialsConfig;
};

export type AppContext = {
  readonly request: Request;
};
