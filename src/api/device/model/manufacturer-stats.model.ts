import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class ManufacturerStats {
  @Field()
  readonly total: number;

  @Field()
  readonly recycled: number;

  @Field()
  readonly totalRawWeight: number;
}
