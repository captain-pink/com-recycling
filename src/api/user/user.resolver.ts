import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";

import { UserService } from "./user.service";
import { AuthScope } from "../../common/constant";
import { User, LoginInput, SignUpInput, QueryUsersArgs } from "./model";
import { BaseResponse } from "../common/model";
import { AppContext } from "../../common/type";

@singleton()
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => BaseResponse)
  queryClientToken(
    @Ctx() ctx: Pick<AppContext, "request">
  ): Promise<BaseResponse> {
    return this.userService.clientLogin(ctx.request.cookieStore!);
  }

  @Mutation(() => BaseResponse)
  login(
    @Arg("data") input: LoginInput,
    @Ctx() ctx: Pick<AppContext, "request">
  ): Promise<BaseResponse> {
    return this.userService.login(input, ctx.request.cookieStore!);
  }

  @Mutation(() => BaseResponse)
  signUp(@Arg("data") input: SignUpInput) {
    return this.userService.signUp(input);
  }

  @Query(() => [User])
  queryUsers(@Args() { userType }: QueryUsersArgs) {
    return this.userService.queryUsers(userType);
  }

  @Authorized(AuthScope.WRITE_RECYCLER)
  @Query(() => Boolean)
  canRecycle() {
    return true;
  }
}
