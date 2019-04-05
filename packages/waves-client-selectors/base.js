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

module.exports.getRowsPerPage = getRowsPerPage
module.exports._getPlaylist = _getPlaylist
