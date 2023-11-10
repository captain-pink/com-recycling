import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { singleton } from "tsyringe";

import { UserService } from "./user.service";
import { LoggedIn, LoginInput, SignUpInput } from "./model";
import { BaseResponse } from "../common/model";
import { AppContext } from "../../common/type";

@singleton()
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
}
