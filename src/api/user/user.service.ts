import { singleton } from "tsyringe";
import { ModelType } from "dynamoose/dist/General";
import { CookieStore } from "@whatwg-node/cookie-store";

import { LoginInput, SignUpInput } from "./model";
import { AuthService, JwtService } from "../../common/service";
import { AuthScope, StoreModelEntryKey } from "../../common/constant";
import { JwtPayload, ModelStore } from "../../common/model";
import { GetUsersCondition, UserItem } from "../../db";
import { ResponseStatus } from "../common/constant";
import { DBEntityType } from "../../db/dynamo/constant";
import { BaseResponse, BaseSerivce } from "../common/model";

@singleton()
export class UserService extends BaseSerivce {
  private readonly userModel: ModelType<UserItem>;

  constructor(
    private readonly modelStore: ModelStore,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {
    super();

    this.userModel = this.modelStore.get(StoreModelEntryKey.USER);
  }

  async login(input: LoginInput, cookieStore: CookieStore) {
    return this.replyWithBaseResponse(async () => {
      const [userItem] = await this.userModel
        .query(
          new GetUsersCondition({
            type: DBEntityType.USER,
            username: input.username,
          })
        )
        .exec();

      if (!userItem) {
        await this.authService.failLogin();
      }

      const passwordValid = await this.authService.verifyLogin(
        input.passowrd,
        userItem.hash
      );

      if (!passwordValid) {
        await this.authService.failLogin();
      }

      const { token, expires } = await this.jwtService.sign(
        new JwtPayload(input.username, userItem.scopes)
      );

      cookieStore?.set({
        name: "_jwt",
        value: token,
        expires: expires * 1000,
        domain: null,
        sameSite: "lax",
        // secure: true,
        // httpOnly: true,
        // domain: "localhost",
      });
    });
  }

  async signUp(input: SignUpInput): Promise<BaseResponse> {
    const { username, password } = input;

    try {
      const hash = await this.authService.hashPassword(password);

      await this.userModel.create({
        type: DBEntityType.USER,
        username: username,
        hash,
        scopes: [AuthScope.READ],
      });

      return new BaseResponse(ResponseStatus.OK);
    } catch {
      return new BaseResponse(ResponseStatus.FAILED);
    }
  }
}
