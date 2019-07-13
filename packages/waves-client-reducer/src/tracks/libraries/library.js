const actionTypes = require('waves-action-types')

const initialState = null

function reducerLibrary(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TRACKS_ADD:
      return action.lib
    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action
      state = { ...state }
      for (deleteId of deleteIds) {
        delete state[deleteId]
      }
      return state
    }
    case actionTypes.TRACKS_INFO_UPDATE: {
      const { ids, key, value } = action
      state = { ...state }
      for (const id of ids) {
        state[id] = { ...state[id], [key]: value }
      }
      return state
    }
    default:
      return state
  }
}

module.exports = reducerLibrary
