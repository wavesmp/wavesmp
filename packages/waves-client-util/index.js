const formatTime = require('format-duration')

const { DEFAULT_PLAYLIST, UPLOAD_PLAYLIST } = require('waves-client-constants')

function shouldAddToDefaultPlaylist(playlistName) {
  return playlistName !== DEFAULT_PLAYLIST && playlistName != UPLOAD_PLAYLIST
}

function normalizeTrack(track, index) {
  return {
    ...track,
    time: formatTime(1000 * track.duration),
    index
  }
}

module.exports.shouldAddToDefaultPlaylist = shouldAddToDefaultPlaylist
module.exports.normalizeTrack = normalizeTrack
