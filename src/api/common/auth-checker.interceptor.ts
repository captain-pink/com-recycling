import {
  AuthCheckerInterface,
  AuthenticationError,
  ResolverData,
} from "type-graphql";
import { singleton } from "tsyringe";

import { AsyncStorageEntries, AuthScope } from "../../common/constant";
import { AppContext } from "../../common/type";
import { AsyncStorageService, JwtService } from "../../common/service";

@singleton()
export class AuthCheckerService
  implements AuthCheckerInterface<AppContext, AuthScope>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly asyncStorageService: AsyncStorageService
  ) {}

  async check(
    { context }: ResolverData<AppContext>,
    scopes: Array<AuthScope>
  ): Promise<boolean> {
    const bearer = context.request.headers.get("authorization") || "";
    const [_, headerToken] = bearer.split(" ");

    const cookieToken = await context.request.cookieStore?.get("_jwt");

    const jwt = cookieToken?.value ?? headerToken;
    console.log("jwt, jw", jwt);
    if (!jwt) {
      throw new AuthenticationError();
    }

    const payload = await this.jwtService.verify(jwt);

    this.asyncStorageService.set(AsyncStorageEntries.JWT_PAYLOAD, payload);

    return scopes.some((scope: AuthScope) => payload.hasScope(scope));
  }
}
