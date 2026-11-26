const CONFIG_KEY = "config";

/* A config object read from storage */
type ConfigRecord = Record<string, unknown>;

/* Initializes a web Storage object. Removes unknown config
 * entries and applies defaults.  */
function init<T extends object>(storage: Storage, defaultConfig: T): T {
  removeUnknownItems(storage);
  const stored = parseConfig(storage.getItem(CONFIG_KEY));
  const defaults = defaultConfig as ConfigRecord;
  removeUnknownState(stored, defaults);
  addMissingState(stored, defaults);
  storage.setItem(CONFIG_KEY, JSON.stringify(stored));
  /* Every default key now has a value of the default's type */
  return stored as T;
}

function parseConfig(value: string | null): ConfigRecord {
  const parsed: unknown = value === null ? null : JSON.parse(value);
  return isObject(parsed) ? parsed : {};
}

/* Remove keys other than:
 * - CONFIG_KEY.
 * - keys that start with @ (most likely used by react) */
function removeUnknownItems(storage: Storage): void {
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key !== null && key !== CONFIG_KEY && !key.startsWith("@")) {
      console.log(`Removing unknown entry in storage: ${key}`);
      storage.removeItem(key);
    }
  }
}

function removeUnknownState(
  state: ConfigRecord,
  defaultState: ConfigRecord,
): void {
  for (const key of Object.keys(state)) {
    const defaultValue = defaultState[key];
    if (!(key in defaultState)) {
      console.log(`Removing invalid entry in storage: ${key}`);
      Reflect.deleteProperty(state, key);
    } else if (isObject(defaultValue)) {
      const value = state[key];
      if (!isObject(value)) {
        console.log(`Found invalid value in storage ${key}: ${String(value)}`);
        console.log(`Replacing with default: ${JSON.stringify(defaultValue)}`);
        state[key] = defaultValue;
      } else {
        removeUnknownState(value, defaultValue);
      }
    }
  }
}

function addMissingState(
  state: ConfigRecord,
  defaultState: ConfigRecord,
): void {
  for (const [key, defaultValue] of Object.entries(defaultState)) {
    const value = state[key];
    if (!(key in state)) {
      console.log(
        `Adding missing state to storage ${key}: ${String(defaultValue)}`,
      );
      state[key] = defaultValue;
    } else if (toType(value) !== toType(defaultValue)) {
      console.log(
        `Invalid config type for key ${key}. Using default ${String(defaultValue)}`,
      );
      state[key] = defaultValue;
    } else if (isObject(defaultValue) && isObject(value)) {
      addMissingState(value, defaultValue);
    }
  }
}

function isObject(obj: unknown): obj is ConfigRecord {
  return toType(obj) === "object";
}

/* https://stackoverflow.com/questions/7390426/
 * better-way-to-get-type-of-a-javascript-variable */
function toType(obj: unknown): string {
  const match = /\s([a-zA-Z]+)/.exec(Object.prototype.toString.call(obj));
  return (match?.[1] ?? "").toLowerCase();
}

export { CONFIG_KEY, init as storageInit };
