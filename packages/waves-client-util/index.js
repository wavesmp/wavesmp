const formatTime = require('format-duration')

const {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  UPLOAD_PLAYLIST,
  routes
} = require('waves-client-constants')

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

function getPlaylistNameFromRoute(pathname) {
  if (pathname === routes.nowplaying) {
    return DEFAULT_PLAYLIST
  }
  if (pathname === routes.library) {
    return FULL_PLAYLIST
  }
  if (pathname === routes.upload) {
    return UPLOAD_PLAYLIST
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
