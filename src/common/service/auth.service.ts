import { singleton } from "tsyringe";
import { AuthenticationError } from "type-graphql";

import { ConfigEntries } from "../constant";
import { ConfigService } from ".";
import { AuthConfig } from "../type";
import { AuthFailedError } from "../../api/common/model";

@singleton()
export class AuthService {
  private readonly authConfig: AuthConfig;

  constructor(private readonly configService: ConfigService) {
    this.authConfig = this.configService.get(ConfigEntries.AUTH);
  }

  hashPassword(password: string) {
    return Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: this.authConfig.hashingCost,
    });
  }

  verifyLogin(password: string, hash: string) {
    return Bun.password.verify(password, hash);
  }

  async failLogin() {
    await Bun.sleep(this.authConfig.throttleLogin);

    throw new AuthFailedError();
  }
}
