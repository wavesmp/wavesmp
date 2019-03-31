const { createSelector } = require('reselect')

const { DEFAULT_PLAYLIST, FULL_PLAYLIST } = require('waves-client-constants')

const { _getPlaylist } = require('./base')
const { createPlaylistSelectors } = require('./playlist')

const playlistSelectors = {}
function getOrCreatePlaylistSelectors(
  playlistName,
  URLSearchParams,
  libProp = 'library'
) {
  let playlistSelector = playlistSelectors[playlistName]
  if (!playlistSelector) {
    playlistSelector = createPlaylistSelectors(
      playlistName,
      URLSearchParams,
      libProp
    )
    playlistSelectors[playlistName] = playlistSelector
  }
  return playlistSelector
}

function getLibraryPlaylistSearch(state) {
  const playlist = _getPlaylist(state, FULL_PLAYLIST)
  if (!playlist) {
    return null
  }
  return playlist.search
}

function getDefaultPlaylistSearch(state) {
  const playlist = _getPlaylist(state, DEFAULT_PLAYLIST)
  if (!playlist) {
    return null
  }
  return playlist.search
}

module.exports.getOrCreatePlaylistSelectors = getOrCreatePlaylistSelectors
module.exports.getLibraryPlaylistSearch = getLibraryPlaylistSearch
module.exports.getDefaultPlaylistSearch = getDefaultPlaylistSearch
