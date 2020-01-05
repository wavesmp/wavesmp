const formatTime = require('format-duration')

const {
  NOW_PLAYING_NAME,
  LIBRARY_NAME,
  UPLOADS_NAME,
  routes
} = require('waves-client-constants')

function shouldAddToDefaultPlaylist(playlistName) {
  return playlistName !== NOW_PLAYING_NAME && playlistName !== UPLOADS_NAME
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

function getPlaylistNameFromRoute(pathname) {
  if (pathname === routes.nowplaying) {
    return NOW_PLAYING_NAME
  }
  if (pathname === routes.library) {
    return LIBRARY_NAME
  }
  if (pathname === routes.upload) {
    return UPLOADS_NAME
  }
  if (pathname.startsWith(routes.playlistBase)) {
    return pathname.slice(routes.playlistBase.length)
  }
  return null
}

module.exports.shouldAddToDefaultPlaylist = shouldAddToDefaultPlaylist
module.exports.normalizeTrack = normalizeTrack
module.exports.filterSelection = filterSelection
module.exports.getPlaylistNameFromRoute = getPlaylistNameFromRoute
