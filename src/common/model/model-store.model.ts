import { ModelType } from "dynamoose/dist/General";
import { Item } from "dynamoose/dist/Item";
import { singleton } from "tsyringe";

import { StoreModelEntryKey } from "../constant";
import { User } from "../../db";

@singleton()
export class ModelStore {
  private readonly _store = new Map<StoreModelEntryKey, ModelType<Item>>([
    [StoreModelEntryKey.USER, User],
  ]);

  get<T extends Item>(key: StoreModelEntryKey) {
    return this._store.get(key) as ModelType<T>;
  }
}
