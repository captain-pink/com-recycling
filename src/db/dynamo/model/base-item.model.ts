import { Item } from "dynamoose/dist/Item";

export class BaseItem extends Item {
  readonly pk?: string;
  readonly sk?: string;
}
