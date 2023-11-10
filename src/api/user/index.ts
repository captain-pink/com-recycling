import { registerEnumType } from "type-graphql";

import { UserType } from "../../db/dynamo/constant";

registerEnumType(UserType, { name: "UserType" });

export { UserResolver } from "./user.resolver";
