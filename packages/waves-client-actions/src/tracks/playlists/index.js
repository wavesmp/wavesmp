const types = require('waves-action-types')
const { DEFAULT_PLAYLIST } = require('waves-client-constants')

function playlistsUpdate(update) {
  return { type: types.PLAYLISTS_UPDATE, update }
}

function playlistCopy(src, dest) {
  return (dispatch, getState, { ws }) => {
    dispatch({ type: types.PLAYLIST_COPY, src, dest })
    ws.sendBestEffortMessage(types.PLAYLIST_COPY, { src, dest })
  }
}

function playlistDelete(playlistName) {
  return (dispatch, getState, { ws }) => {
    ws.sendBestEffortMessage(types.PLAYLIST_DELETE, { playlistName })
    dispatch({ type: types.PLAYLIST_DELETE, playlistName })
  }
}

function playlistMove(src, dest) {
  return (dispatch, getState, { ws }) => {
    ws.sendBestEffortMessage(types.PLAYLIST_MOVE, { src, dest })
    dispatch({ type: types.PLAYLIST_MOVE, src, dest })
  }
}

function playlistAdd(source, dest) {
  return (dispatch, getState, { ws }) => {
    console.log(`Adding from playlist ${source} to ${dest}`)

    const { tracks } = getState()
    const { playlists } = tracks

    const { selection } = playlists[source]
    const addIndexes = Object.keys(selection).map(i => parseInt(i))
    addIndexes.sort((a, b) => a - b)

    const addTracks = addIndexes.map(addIndex => selection[addIndex])

    dispatch({ type: types.PLAYLIST_ADD, playlistName: dest, addTracks })
    ws.sendBestEffortMessage(types.PLAYLIST_ADD, {
      playlistName: dest,
      trackIds: addTracks
    })
  }
}

function playlistCreate(playlistName) {
  return async (dispatch, getState, { ws }) => {
    const addTracks = []
    await ws.sendAckedMessage(types.PLAYLIST_ADD, {
      playlistName,
      trackIds: addTracks
    })
    dispatch({ type: types.PLAYLIST_ADD, playlistName, addTracks })
  }
}

module.exports.playlistsUpdate = playlistsUpdate
module.exports.playlistCopy = playlistCopy
module.exports.playlistDelete = playlistDelete
module.exports.playlistMove = playlistMove
module.exports.playlistAdd = playlistAdd
module.exports.playlistCreate = playlistCreate

Object.assign(module.exports, require('./selection'))
