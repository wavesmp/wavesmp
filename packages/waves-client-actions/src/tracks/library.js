const types = require('waves-action-types')

function libraryInfoUpdate(id, attr, update) {
  return (dispatch, getState, { ws }) => {
    dispatch({ type: types.LIBRARY_TRACK_UPDATE, id, attr, update })
    ws.sendBestEffortMessage(types.LIBRARY_TRACK_UPDATE, {id, attr, update})
  }
}

module.exports.libraryInfoUpdate = libraryInfoUpdate
