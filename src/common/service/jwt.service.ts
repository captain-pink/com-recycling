import { injectable } from "tsyringe";
import { SignJWT, jwtVerify } from "jose";
import { AuthenticationError } from "type-graphql";

import { ConfigService } from ".";
import { JwtConfig } from "../type";
import { AuthScope, ConfigEntries } from "../constant";
import { JwtPayload } from "../model";

@injectable()
export class JwtService {
  private readonly ENCODED_SECRET: Uint8Array;
  private readonly MSEC_IN_HOUR: number = 60 * 60 * 1000;
  private readonly jwtConfig: JwtConfig;

  constructor(private readonly configService: ConfigService) {
    this.jwtConfig = this.configService.get(ConfigEntries.AUTH).jwt;
    this.ENCODED_SECRET = new TextEncoder().encode(this.jwtConfig.secret);
  }

  // TODO: To add JTI to make more secure.
  async sign(payload: JwtPayload): Promise<{ token: string; expires: number }> {
    const expires = this.calculateExp();

    const jwt = new SignJWT({ scopes: Array.from(payload.scopes) })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setSubject(payload.id)
      .setExpirationTime(this.calculateExp());

    return { expires, token: await jwt.sign(this.ENCODED_SECRET) };
  }

  async verify(jwt: string): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify<{
        scopes: Array<AuthScope>;
        sub: string;
        exp: number;
      }>(jwt, this.ENCODED_SECRET);

      const { scopes, sub, exp } = payload;

      return new JwtPayload(sub, scopes, exp);
    } catch {
      throw new AuthenticationError();
    }
  }

  private calculateExp(): number {
    const { expHours } = this.jwtConfig;

    const expInMsec = Date.now() + expHours * this.MSEC_IN_HOUR;

    return Math.ceil(expInMsec / 1000);
  }
}
