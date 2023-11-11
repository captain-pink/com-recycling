import { singleton } from "tsyringe";
import { ModelType } from "dynamoose/dist/General";
import { CookieStore } from "@whatwg-node/cookie-store";

import { LoginInput, SignUpInput } from "./model";
import { AuthService, JwtService } from "../../common/service";
import { AuthScope, StoreModelEntryKey } from "../../common/constant";
import { JwtPayload, ModelStore } from "../../common/model";
import { GetUsersCondition, UserItem } from "../../db";
import { ResponseStatus } from "../common/constant";
import { DBEntityType, UserType } from "../../db/dynamo/constant";
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
            entityType: DBEntityType.USER,
            email: input.email,
          })
        )
        .exec();

      if (!userItem) {
        await this.authService.failLogin();
      }

      const passwordValid = await this.authService.verifyLogin(
        input.password,
        userItem.hash
      );

      if (!passwordValid) {
        await this.authService.failLogin();
      }

      const { token, expires } = await this.jwtService.sign(
        new JwtPayload(input.email, userItem.scopes)
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
    const { email, password, type, companyName } = input;
    const scope =
      type === UserType.MANUFACTURER
        ? AuthScope.WRITE_MANUFACTURER
        : AuthScope.WRITE_RECYCLER;

    try {
      const hash = await this.authService.hashPassword(password);

      await this.userModel.create({
        entityType: DBEntityType.USER,
        type,
        email,
        hash,
        companyName,
        scopes: [scope],
      });

      return new BaseResponse(ResponseStatus.OK);
    } catch (error) {
      console.error("Failed to sign up user", error);
      return new BaseResponse(ResponseStatus.FAILED);
    }
  }
}
