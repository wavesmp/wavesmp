const types = require('waves-action-types')
const {
  NOW_PLAYING_NAME,
  LIBRARY_NAME,
  libTypes
} = require('waves-client-constants')
const { getFilteredSelection } = require('waves-client-selectors')
const {
  getOrCreatePlaylistSelectors,
  getLibraryPlaylistSearch
} = require('waves-client-selectors')

const { reorder } = require('./reorder')

function playlistsUpdate(update) {
  return { type: types.PLAYLISTS_UPDATE, update }
}

function playlistCopy(src, dest) {
  return async (dispatch, getState, { ws }) => {
    await ws.sendAckedMessage(types.PLAYLIST_COPY, { src, dest })
    dispatch({ type: types.PLAYLIST_COPY, src, dest })
  }
}

function playlistDelete(playlistName) {
  return async (dispatch, getState, { ws }) => {
    await ws.sendAckedMessage(types.PLAYLIST_DELETE, { playlistName })
    dispatch({ type: types.PLAYLIST_DELETE, playlistName })
  }
}

function playlistMove(src, dest) {
  return async (dispatch, getState, { ws }) => {
    await ws.sendAckedMessage(types.PLAYLIST_MOVE, { src, dest })
    dispatch({ type: types.PLAYLIST_MOVE, src, dest })
  }
}

function playlistAdd(source, dest) {
  return (dispatch, getState, { ws }) => {
    console.log(`Adding from playlist ${source} to ${dest}`)

    const selection = getFilteredSelection(getState(), source)
    const addIndexes = Array.from(selection.keys())
    addIndexes.sort((a, b) => a - b)

    const addTracks = addIndexes.map(addIndex => selection.get(addIndex))

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
    dispatch({ type: types.PLAYLIST_ADD, playlistName, addTracks })
    ws.sendBestEffortMessage(types.PLAYLIST_ADD, {
      playlistName,
      trackIds: addTracks
    })
  }
}

function playlistReorder(playlistName, insertAt) {
  return async (dispatch, getState, { ws }) => {
    const state = getState()
    const filteredSelection = getFilteredSelection(state, playlistName)
    const playlist = state.tracks.playlists[playlistName]
    const { reordered, newSelection, newIndex } = reorder(
      playlist,
      filteredSelection,
      insertAt
    )
    dispatch({
      type: types.PLAYLIST_REORDER,
      playlistName,
      reordered,
      newSelection,
      newIndex
    })
    await ws.sendAckedMessage(types.PLAYLIST_REORDER, {
      playlistName,
      selection: [...filteredSelection.entries()],
      insertAt
    })
  }
}

/* Only supports waves library */
function playlistSort(sortKey, ascending) {
  return async (dispatch, getState, { ws }) => {
    const state = getState()
    const search = getLibraryPlaylistSearch(state)
    const { getRouterQueryParams } = getOrCreatePlaylistSelectors(
      LIBRARY_NAME,
      URLSearchParams,
      libTypes.WAVES
    )
    const qp = new URLSearchParams(getRouterQueryParams(state, search))
    qp.set('sortKey', sortKey)
    qp.set('order', ascending ? 'asc' : 'desc')

    const { tracks } = state
    const { libraries } = tracks
    const lib = libraries[libTypes.WAVES]

    dispatch({
      type: types.PLAYLIST_SEARCH_UPDATE,
      name: LIBRARY_NAME,
      search: qp.toString()
    })
    dispatch({
      type: types.PLAYLIST_SORT,
      lib,
      name: LIBRARY_NAME,
      sortKey,
      ascending
    })
  }
}

module.exports.playlistsUpdate = playlistsUpdate
module.exports.playlistCopy = playlistCopy
module.exports.playlistDelete = playlistDelete
module.exports.playlistMove = playlistMove
module.exports.playlistAdd = playlistAdd
module.exports.playlistCreate = playlistCreate
module.exports.playlistReorder = playlistReorder
module.exports.playlistSort = playlistSort

Object.assign(module.exports, require('./selection'))
