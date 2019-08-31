const types = require('waves-action-types')
const { UPLOADS_NAME } = require('waves-client-constants')

const { toastErr } = require('../toasts')

function trackUploadsDelete() {
  return (dispatch, getState, { player, ws }) => {
    const { playing, playlists } = getState().tracks
    const { track } = playing
    const playlist = playlists[UPLOADS_NAME]
    const { selection } = playlist
    const deleteIds = new Set(selection.values())
    if (track && deleteIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause()
    }
    dispatch({
      type: types.TRACKS_DELETE,
      deleteIds,
      libName: UPLOADS_NAME
    })
  }
}

function tracksLocalInfoUpdate(id, key, value, libName) {
  return { type: types.TRACKS_INFO_UPDATE, ids: [id], key, value, libName }
}

function tracksInfoUpdate(id, key, value, libName) {
  return async (dispatch, getState, { ws }) => {
    dispatch({ type: types.TRACKS_INFO_UPDATE, ids: [id], key, value, libName })
    try {
      await ws.sendAckedMessage(types.TRACKS_INFO_UPDATE, { id, key, value })
    } catch (err) {
      dispatch(toastErr(`${err}`))
    }
  }
}

module.exports.trackUploadsDelete = trackUploadsDelete
module.exports.tracksLocalInfoUpdate = tracksLocalInfoUpdate
module.exports.tracksInfoUpdate = tracksInfoUpdate

Object.assign(
  module.exports,
  require('./playing'),
  require('./playlists'),
  require('./sideEffects'),
  require('./add'),
  require('./delete'),
  require('./keybindings'),
  require('./remove'),
  require('./tracknext'),
  require('./toggle'),
  require('./upload')
)
