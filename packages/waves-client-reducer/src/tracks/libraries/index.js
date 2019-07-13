const reducerLibrary = require('./library')

const initialState = {}

function reducerLibraries(state = initialState, action) {
  const { libType } = action
  if (libType) {
    return { ...state, [libType]: reducerLibrary(state[libType], action) }
  }
  return state
}

module.exports = reducerLibraries
