import { Field, ObjectType, InputType } from "type-graphql";

@InputType("ComponentInput")
@ObjectType()
export class Component {
  @Field()
  readonly material: string;

  @Field()
  readonly amount: number;
}

@ObjectType()
export class Device {
  @Field()
  readonly manufacturerId: string;

  @Field()
  readonly serialNumber: string;

  @Field()
  readonly category: string;

  @Field({ nullable: true })
  readonly deviceType: string;

  @Field(() => [Component], { nullable: true })
  readonly components?: Array<Component>;

  @Field()
  readonly isRecycled: boolean;

  @Field({ nullable: true })
  readonly recycledBy: string;

  @Field()
  readonly totalCost: number;
}
