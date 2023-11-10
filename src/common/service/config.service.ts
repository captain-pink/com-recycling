import { inject, singleton } from "tsyringe";

import { InjectionToken } from "../constant";
import { ApplicationConfig } from "../type";

@singleton()
export class ConfigService<Config extends object = ApplicationConfig> {
  constructor(
    @inject(InjectionToken.APPLICATION_CONFIG)
    private readonly config: Config
  ) {}

  get<ConfigToken extends keyof Config>(
    configToken: ConfigToken
  ): Config[ConfigToken] {
    return this.config[configToken];
  }
}
