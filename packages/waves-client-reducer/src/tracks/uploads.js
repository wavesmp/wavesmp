const actionTypes = require('waves-action-types')

const initialState = null

function reducerUploads(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TRACK_UPLOADS_UPDATE: {
      const { update } = action
      const newState = {...state}
      for (const upload of update) {
        newState[upload.id] = upload
      }
      return newState
    }
    case actionTypes.TRACK_UPLOADS_DELETE: {
      const { deleteIds } = action
      const newState = {...state}
      for (deleteId of deleteIds) {
        delete newState[deleteId]
      }
      return newState
    }
    case actionTypes.UPLOAD_TRACK_UPDATE: {
      return {...state, [action.id]: {
          ...state[action.id],
          [action.attr]: action.update
        }
      }
    }
    default:
      return state
  }
}

module.exports = reducerUploads
