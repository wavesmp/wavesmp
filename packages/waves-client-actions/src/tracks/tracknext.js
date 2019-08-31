const types = require('waves-action-types')
const { NOW_PLAYING_NAME } = require('waves-client-constants')
const { getOrCreatePlaylistSelectors } = require('waves-client-selectors')
const {
  normalizeTrack,
  shouldAddToDefaultPlaylist
} = require('waves-client-util')

const { toastErr } = require('../toasts')
const { getLibNameForPlaylistName } = require('./util')

function trackNext(URLSearchParams) {
  return async (dispatch, getState, { player, ws }) => {
    await _trackNext(dispatch, getState, URLSearchParams, player, ws, false)
  }
}

function trackPrevious(URLSearchParams) {
  return async (dispatch, getState, { player, ws }) => {
    await _trackNext(dispatch, getState, URLSearchParams, player, ws, true)
  }
}

function trackEnded(URLSearchParams) {
  return async (dispatch, getState, { player, ws }) => {
    if (getState().tracks.playing.repeat) {
      player.repeat()
    } else {
      await _trackNext(dispatch, getState, URLSearchParams, player, ws, false)
    }
  }
}

async function _trackNext(
  dispatch,
  getState,
  URLSearchParams,
  player,
  ws,
  prev
) {
  const state = getState()
  const { tracks } = state
  const { libraries, playing, playlists } = tracks
  const { playlist: playlistName, isPlaying, shuffle } = playing
  const playlist = playlists[playlistName]
  const libName = getLibNameForPlaylistName(playlistName)
  const lib = libraries[libName]

  const { getSearchItems } = getOrCreatePlaylistSelectors(
    playlistName,
    URLSearchParams,
    libName
  )
  const searchItems = getSearchItems(state, playlist.search)
  const nextTrack = getNextTrack(searchItems, playlist, shuffle, prev, lib)

  dispatch({
    type: types.TRACK_NEXT,
    nextTrack,
    playlistName
  })
  if (nextTrack) {
    if (shouldAddToDefaultPlaylist(playlistName)) {
      ws.sendBestEffortMessage(types.PLAYLIST_ADD, {
        playlistName: NOW_PLAYING_NAME,
        trackIds: [nextTrack.id]
      })
    }
    try {
      await player.trackNext(nextTrack, isPlaying)
    } catch (err) {
      dispatch(toastErr(`${err}`))
    }
  } else {
    player.pause()
    player.seek(0)
  }
}

function getNextTrack(searchItems, playlist, shuffle, prev, lib) {
  const { tracks, index } = playlist
  const items = searchItems || tracks
  const { length } = items
  if (length === 0) {
    return null
  }
  if (shuffle) {
    const i = Math.floor(Math.random() * length)
    if (searchItems) {
      return items[i]
    }
    const trackId = tracks[i]
    const track = lib[trackId]
    return normalizeTrack(track, index)
  }

  if (searchItems) {
    /* Find the track after the current one.
     * If prev, find the track before the current one. */
    let start
    let end
    if (prev) {
      start = 1
      end = length
    } else {
      start = 0
      end = length - 1
    }

    for (let i = start; i < end; i += 1) {
      const item = items[i]
      if (item.index === index) {
        if (prev) {
          return items[i - 1]
        }
        return items[i + 1]
      }
    }
    return null
  }

  if (prev && index > 0) {
    const nextIndex = index - 1
    const trackId = items[nextIndex]
    const track = lib[trackId]
    return normalizeTrack(track, nextIndex)
  }
  if (!prev && index < length - 1) {
    const nextIndex = index + 1
    const trackId = items[nextIndex]
    const track = lib[trackId]
    return normalizeTrack(track, nextIndex)
  }
  return null
}

module.exports.trackNext = trackNext
module.exports.trackPrevious = trackPrevious
module.exports.trackEnded = trackEnded
