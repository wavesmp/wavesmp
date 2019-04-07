const DEFAULT_SEARCH_STRING = ''

function getRowsPerPage(state) {
  return state.account.rowsPerPage
}

function _getPlaylist(state, playlistName) {
  const { playlists } = state.tracks
  if (!playlists) {
    return null
  }
  return playlists[playlistName]
}

function getPlaylistSearch(state, playlistName) {
  const playlist = _getPlaylist(state, playlistName)
  if (!playlist) {
    return DEFAULT_SEARCH_STRING
  }
  return playlist.search
}

module.exports.getPlaylistSearch = getPlaylistSearch
module.exports.getRowsPerPage = getRowsPerPage
module.exports._getPlaylist = _getPlaylist
