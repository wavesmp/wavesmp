import { storageInit } from "./storageInit";

const CONFIG_KEY = "config";
const DEFAULT_LOCAL_CONFIG = {
  columns: ["Name", "State", "Time", "Artist", "Genre"],
  rowsPerPage: 25,
  lastIdp: "",
  theme: "light",
  volume: 1.0,
};

/* Exposes get/set methods that sit above the
 * web storage APIs */
class LocalState {
  constructor(storage) {
    this.config = storageInit(storage, DEFAULT_LOCAL_CONFIG);
    this.storage = storage;
  }

  async setItem(key, val) {
    this.config[key] = val;
    this.storage.setItem(CONFIG_KEY, JSON.stringify(this.config));
  }

  async getItem(key) {
    return this.config[key];
  }

  async keys() {
    return Object.keys(this.config);
  }
}

export { LocalState };
