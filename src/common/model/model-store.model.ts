import { ModelType } from "dynamoose/dist/General";
import { Item } from "dynamoose/dist/Item";
import { singleton } from "tsyringe";

import { StoreModelEntryKey } from "../constant";
import { User, Device, DeviceCategory } from "../../db";
import { Stats } from "../../db/dynamo/model/stats.model";

@singleton()
export class ModelStore {
  private readonly _store = new Map<StoreModelEntryKey, ModelType<Item>>([
    [StoreModelEntryKey.USER, User],
    [StoreModelEntryKey.DEVICE, Device],
    [StoreModelEntryKey.DEVICE_CATEGORY, DeviceCategory],
    [StoreModelEntryKey.STATS, Stats],
  ]);

  get<T extends Item>(key: StoreModelEntryKey) {
    return this._store.get(key) as ModelType<T>;
  }
}
