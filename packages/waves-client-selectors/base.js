const formatTime = require('format-duration')

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

// TODO refactor with client web
function normalizeTrack(track, index) {
  const time = formatTime(1000 * track.duration)
  return { ...track, time, index }
}

module.exports.getRowsPerPage = getRowsPerPage
module.exports._getPlaylist = _getPlaylist
module.exports.normalizeTrack = normalizeTrack
