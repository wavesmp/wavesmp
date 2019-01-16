const types = require('waves-action-types')
const { DEFAULT_PLAYLIST } = require('waves-client-constants')

function playlistsUpdate(update) {
  return { type: types.PLAYLISTS_UPDATE, update }
}

function playlistSearchUpdate(name, search) {
  return { type: types.PLAYLIST_SEARCH_UPDATE, name, search }
}

function playlistCopy(src, dest) {
  return (dispatch, getState, { ws }) => {
    dispatch({ type: types.PLAYLIST_COPY, src, dest })
    ws.sendBestEffortMessage(types.PLAYLIST_COPY, { src, dest })
  }
}

function playlistDelete(playlistName) {
  return (dispatch, getState, { ws }) => {
    ws.sendBestEffortMessage(types.PLAYLIST_DELETE, { playlistName} )
    dispatch({ type: types.PLAYLIST_DELETE, playlistName })
  }
}

function playlistMove(src, dest) {
  return (dispatch, getState, { ws }) => {
    ws.sendBestEffortMessage(types.PLAYLIST_MOVE, {src, dest})
    dispatch({ type: types.PLAYLIST_MOVE, src, dest })
  }
}

function playlistRemove(playlistName) {
  return (dispatch, getState, { ws }) => {
    console.log(`Removing from playlist ${playlistName}`)
    const { tracks } = getState()
    const { playlists } = tracks
    const { selection } = playlists[playlistName]

    const deleteIndexes = Object.keys(selection).map(i => parseInt(i))
    deleteIndexes.sort((a, b) => b - a)

    dispatch({ type: types.PLAYLIST_REMOVE, playlistName, deleteIndexes })
    ws.sendBestEffortMessage(types.PLAYLIST_REMOVE,
      { playlistName, deleteIndexes })
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
    ws.sendBestEffortMessage(
      types.PLAYLIST_ADD, {playlistName: dest, trackIds: addTracks})
  }
}

function playlistSort(name, sortKey, ascending) {
  return (dispatch, getState) => {
    const { tracks } = getState()
    const { library } = tracks
    dispatch({ type: types.PLAYLIST_SORT, library, name, sortKey, ascending })
  }
}

module.exports.playlistsUpdate = playlistsUpdate
module.exports.playlistSearchUpdate = playlistSearchUpdate
module.exports.playlistCopy = playlistCopy
module.exports.playlistDelete = playlistDelete
module.exports.playlistMove = playlistMove
module.exports.playlistRemove = playlistRemove
module.exports.playlistAdd = playlistAdd
module.exports.playlistSort = playlistSort

Object.assign(module.exports, require('./selection'))
