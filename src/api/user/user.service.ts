import { singleton } from "tsyringe";
import { ModelType } from "dynamoose/dist/General";
import { CookieStore } from "@whatwg-node/cookie-store";
import { randomUUID } from "crypto";

import { LoginInput, SignUpInput, User } from "./model";
import { AuthService, ConfigService, JwtService } from "../../common/service";
import {
  AuthScope,
  ConfigEntries,
  StoreModelEntryKey,
} from "../../common/constant";
import { JwtPayload, ModelStore } from "../../common/model";
import { GetUsersCondition, UserItem } from "../../db";
import { ResponseStatus } from "../common/constant";
import { DBEntityType, UserType } from "../../db/dynamo/constant";
import { BaseResponse, BaseSerivce } from "../common/model";
import { StatsItem } from "../../db/dynamo/model/stats.model";
import { isProd } from "..";
import { SystemConfig } from "../../common/type";

@singleton()
export class UserService extends BaseSerivce {
  private readonly userModel: ModelType<UserItem>;
  private readonly statsModel: ModelType<StatsItem>;

  constructor(
    private readonly modelStore: ModelStore,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configSerivice: ConfigService
  ) {
    super();

    this.userModel = this.modelStore.get(StoreModelEntryKey.USER);
    this.statsModel = this.modelStore.get(StoreModelEntryKey.STATS);
  }

  async clientLogin(cookieStore: CookieStore) {
    return this.replyWithBaseResponse(async () => {
      const { token, expires } = await this.jwtService.sign(
        new JwtPayload("ANONYMOUS", [AuthScope.READ])
      );

      this.setJwtCookie(cookieStore, token, expires);
    });
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
        new JwtPayload(userItem.userId, userItem.scopes)
      );

      this.setJwtCookie(cookieStore, token, expires);
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

      const userId = randomUUID();

      await this.userModel.create({
        entityType: DBEntityType.USER,
        userType: type,
        email,
        hash,
        companyName,
        userId,
        scopes: [scope],
      });

      if (type === UserType.MANUFACTURER) {
        await this.statsModel.create({
          manufacturerId: userId,
          sk: DBEntityType.STATS,
        });
      }

      return new BaseResponse(ResponseStatus.OK);
    } catch (error) {
      console.error("Failed to sign up user", error);
      return new BaseResponse(ResponseStatus.FAILED);
    }
  }

  async queryUsers(userType: UserType): Promise<Array<User>> {
    const users = await this.userModel
      .query(
        new GetUsersCondition({
          entityType: DBEntityType.USER,
          userType: userType,
        })
      )
      .exec();
    return users.map((user) => {
      return {
        userId: user.userId,
        companyName: user.companyName,
      };
    });
  }

  private setJwtCookie(
    cookieStore: CookieStore,
    token: string,
    expires: number
  ) {
    cookieStore?.set({
      name: "_jwt",
      value: token,
      expires: expires * 1000,
      domain: null,
      // sameSite: isProd() ? "none" : "lax",
      // secure: isProd(),
      // httpOnly: isProd(),
    });
  }
}
