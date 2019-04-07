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

function filterSelection(displayItems, selection) {
  const filtered = new Map()
  for (const { index } of displayItems) {
    if (selection.has(index)) {
      filtered.set(index, selection.get(index))
    }
  }
  return filtered
}

module.exports.shouldAddToDefaultPlaylist = shouldAddToDefaultPlaylist
module.exports.normalizeTrack = normalizeTrack
module.exports.filterSelection = filterSelection
