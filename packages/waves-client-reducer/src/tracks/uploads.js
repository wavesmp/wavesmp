const actionTypes = require('waves-action-types')

const initialState = null

function reducerUploads(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TRACK_UPLOADS_UPDATE: {
      const { update } = action
      const newState = { ...state }
      for (const upload of update) {
        newState[upload.id] = upload
      }
      return newState
    }
    case actionTypes.TRACK_UPLOADS_DELETE: {
      const { deleteIds } = action
      const newState = { ...state }
      for (deleteId of deleteIds) {
        delete newState[deleteId]
      }
      return newState
    }
    case actionTypes.UPLOAD_TRACKS_UPDATE: {
      const { ids, key, value } = action
      const newState = { ...state }
      for (const id of ids) {
        newState[id] = { ...state[id], [key]: value }
      }
      return newState
    }
    default:
      return state
  }
}

module.exports = reducerUploads
