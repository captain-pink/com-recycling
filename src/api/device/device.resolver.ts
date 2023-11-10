import { Arg, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";

@singleton()
@Resolver()
export class DeviceResolver {
  @Query(() => String)
  login() {
    return "";
  }
}
