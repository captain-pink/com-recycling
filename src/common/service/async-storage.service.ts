import { AsyncLocalStorage } from "async_hooks";
import { singleton } from "tsyringe";

import { InternalServerError } from "../../api/common/model";

@singleton()
export class AsyncStorageService<
  K extends string | number = string | number,
  V = any
> {
  static getInitialStore<K extends string | number, V = any>() {
    return new Map<K, V>();
  }

  private readonly storage = new AsyncLocalStorage<Map<K, V>>();

  run(callbackFn: () => any): Promise<any> {
    return this.storage.run(AsyncStorageService.getInitialStore(), callbackFn);
  }

  runSync(): void {
    this.storage.enterWith(AsyncStorageService.getInitialStore());
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  private get store(): Map<K, V> {
    const store = this.storage.getStore();

    if (!store) {
      throw new InternalServerError();
    }

    return store;
  }
}
