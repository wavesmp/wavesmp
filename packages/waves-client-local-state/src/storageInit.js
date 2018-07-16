const CONFIG_KEY = 'config'


/* Initializes a web Storage object. Removes unknown config
 * entries and applies defaults.  */
function init(storage, defaultConfig) {
  removeUnknownItems(storage)

  const state = JSON.parse(storage.getItem(CONFIG_KEY)) || {}
  removeUnknownState(state, defaultConfig)
  addMissingState(state, defaultConfig)
  storage.setItem(CONFIG_KEY, JSON.stringify(state))
  return state
}


/* Remove keys other than:
 * - CONFIG_KEY.
 * - keys that start with @ (most likely used by react) */
function removeUnknownItems(storage) {
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i)
    if (key != CONFIG_KEY && !key.startsWith('@')) {
      console.log(`Removing unknown entry in storage: ${key}`)
      storage.removeItem(key)
    }
  }
}


function removeUnknownState(state, defaultState) {
  for (const key in state) {
    if (!(key in defaultState)) {
      console.log(`Removing invalid entry in storage: ${key}`)
      delete state[key]
    } else if (isObject(defaultState[key])) {
      if (!isObject(state[key])) {
        console.log(`Found invalid value in storage ${key}: ${state[key]}`)
        console.log(`Replacing with default: ${defaultState[key]}`)
        state[key] = defaultState[key]
      } else {
        removeUnknownState(state[key], defaultState[key])
      }
    }
  }
}


function addMissingState(state, defaultState) {
  for (const key in defaultState) {
    if (!(key in state)) {
      console.log(`Adding missing state to storage ${key}: ${defaultState[key]}`)
      state[key] = defaultState[key];
    } else if (toType(state[key]) !== toType(defaultState[key])) {
      console.log(`Invalid config type for key ${key}. Using default ${defaultState[key]}`)
      state[key] = defaultState[key];
    } else if (isObject(defaultState[key])) {
      addMissingState(state[key], defaultState[key]);
    }
  }
}


function isObject(obj) {
  return toType(obj) === 'object'
}


/* https://stackoverflow.com/questions/7390426/
 * better-way-to-get-type-of-a-javascript-variable */
function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

module.exports.storageInit = init
module.exports.CONFIG_KEY = CONFIG_KEY
