import { storageInit } from "./storageInit";

const CONFIG_KEY = "config";

/* Settings stored in localStorage */
interface LocalConfig {
  columns: string[];
  rowsPerPage: number;
  lastIdp: string;
  theme: string;
  volume: number;
}

const DEFAULT_LOCAL_CONFIG: LocalConfig = {
  columns: ["Name", "State", "Time", "Artist", "Genre"],
  rowsPerPage: 25,
  lastIdp: "",
  theme: "light",
  volume: 1.0,
};

/* Exposes get/set methods that sit above the
 * web storage APIs */
class LocalState {
  config: LocalConfig;
  storage: Storage;

  constructor(storage: Storage) {
    this.config = storageInit(storage, DEFAULT_LOCAL_CONFIG);
    this.storage = storage;
  }

  async setItem<K extends keyof LocalConfig>(
    key: K,
    val: LocalConfig[K],
  ): Promise<void> {
    this.config[key] = val;
    this.storage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    return Promise.resolve();
  }

  async getItem<K extends keyof LocalConfig>(key: K): Promise<LocalConfig[K]> {
    return Promise.resolve(this.config[key]);
  }

  async keys(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.config));
  }
}

export { LocalState };
export type { LocalConfig };
