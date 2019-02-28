const types = require('waves-action-types')

function libraryInfoUpdate(id, key, value) {
  return (dispatch, getState, { ws }) => {
    dispatch({ type: types.LIBRARY_TRACK_UPDATE, ids: [id], key, value })
    ws.sendBestEffortMessage(types.LIBRARY_TRACK_UPDATE, { id, key, value })
  }
}

module.exports.libraryInfoUpdate = libraryInfoUpdate
