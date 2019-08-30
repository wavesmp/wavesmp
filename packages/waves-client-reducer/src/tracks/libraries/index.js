const reducerLibrary = require('./library')

const initialState = {}

function reducerLibraries(state = initialState, action) {
  const { libName } = action
  if (libName) {
    return { ...state, [libName]: reducerLibrary(state[libName], action) }
  }
  return state
}

module.exports = reducerLibraries
