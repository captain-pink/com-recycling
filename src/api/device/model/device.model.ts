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

  @Field(() => [Component])
  readonly components: Array<Component>;
}
