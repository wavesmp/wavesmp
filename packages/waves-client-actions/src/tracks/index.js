const types = require('waves-action-types')
const { DEFAULT_PLAYLIST, FULL_PLAYLIST, UPLOAD_PLAYLIST } = require('waves-client-constants')
const { getOrCreatePlaylistSelectors } = require('waves-client-selectors')

function trackToggle(id, playlistName, playId) {
  return (dispatch, getState, { player, ws }) => {
    const { tracks } = getState()
    const { library, playing, uploads } = tracks

    const track = getTrackById(id, library, uploads)
    const { playlist: oldPlaylistName } = playing

    player.trackToggle(track)
    dispatch({
      type: types.TRACK_TOGGLE,
      playlistName,
      playId,
      track,
      oldPlaylistName,
      startDate: new Date()
    })

    /* By default, playing a track adds it to the default playlist.
     * Unless, it it part of certain playlists */
    if (shouldAddToDefaultPlaylist(playlistName)) {
      ws.sendBestEffortMessage(
        types.PLAYLIST_ADD, {playlistName: DEFAULT_PLAYLIST, trackIds: [id]})
    }
  }
}

function trackNext(URLSearchParams) {
  return (dispatch, getState, { player, ws }) => {
    _trackNext(dispatch, getState, URLSearchParams, player, ws, false)
  }
}

function trackPrevious(URLSearchParams) {
  return (dispatch, getState, { player, ws }) => {
    _trackNext(dispatch, getState, URLSearchParams, player, ws, true)
  }
}

function trackEnded(URLSearchParams) {
  return (dispatch, getState, { player, ws }) => {
    const { tracks } = getState()
    const { playing } = tracks
    const { repeat } = playing

    if (repeat) {
      player.repeat()
      dispatch({ type: types.PLAYING_TRACK_REPEAT, startDate: new Date() })
    } else {
      _trackNext(dispatch, getState, URLSearchParams, player, ws, false)
    }
  }
}

function _trackNext(dispatch, getState, URLSearchParams, player, ws, prev) {
  const { tracks } = getState()
  const { library, playing, playlists, uploads } = tracks
  const { playlist: playlistName, isPlaying, shuffle } = playing
  const playlist = playlists[playlistName]
  const { playId, search } = playlist

  // TODO The playlist.search and location.search should ideally be in sync.
  // Currently, they are synced in the render() method, but there should
  // be a better way
  const { getSearchItems } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const searchItems = getSearchItems(tracks, search)

  /* These are different data structures. Need to handle with care below */
  // TODO try to simplify or break up implementation below
  const items = searchItems || playlist.tracks

  let nextTrack = null
  const { length } = items
  if (length === 0) {
    nextTrack = null
  } else if (shuffle) {
    if (searchItems) {
      nextTrack = items[Math.floor(Math.random() * length)]
    } else {
      const i = Math.floor(Math.random() * length)
      const trackId = items[i]
      const track = getTrackById(trackId, library, uploads)
      nextTrack = {...track, playId: i + ''}
    }
  } else {
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
      if (searchItems && item.playId === playId) {
        if (prev) {
          nextTrack = items[i - 1]
          break
        }
        nextTrack = items[i + 1]
        break
      } else if (!searchItems && playId === ('' + i)) {
        let trackId
        let playId
        if (prev) {
          trackId = items[i - 1]
          playId = (i - 1) + ''
        } else {
          trackId = items[i + 1]
          playId = (i + 1) + ''
        }
        const track = getTrackById(trackId, library, uploads)
        nextTrack = {...track, playId}
        break
      }
    }
  }

  if (nextTrack) {
    player.trackNext(nextTrack, isPlaying)
  }
  dispatch({
    type: types.TRACK_NEXT,
    nextTrack,
    playlistName,
    startDate: new Date()
  })
  if (nextTrack && shouldAddToDefaultPlaylist(playlistName)) {
    ws.sendBestEffortMessage(
      types.PLAYLIST_ADD, {playlistName: DEFAULT_PLAYLIST, trackIds: [nextTrack.id]})
  }
}

function trackUploadsUpdate(update) {
    return { type: types.TRACK_UPLOADS_UPDATE, update }
}

function tracksUpdate(update) {
  return (dispatch, getState) => {
    const { tracks } = getState()
    const { library } = tracks
    const libraryById = {...library}
    updateLibraryById(libraryById, update)

    // TODO nit: improve naming. Just using libraryById
    // here to prevent conflict with library
    dispatch({ type: types.TRACKS_UPDATE, libraryById })
  }
}

function tracksUpload(trackSource) {
  return async (dispatch, getState, { player, ws }) => {
    const { tracks } = getState()
    const { playing, uploads } = tracks
    const { track } = playing
    const uploadValues = Object.values(uploads)
    const { uploaded } = await player.upload(trackSource, uploadValues)
    ws.sendBestEffortMessage(types.TRACKS_UPDATE, {tracks: uploaded})
    const deleteIds = new Set(uploaded.map(t => t.id))
    dispatch({ type: types.TRACK_UPLOADS_DELETE, deleteIds })
    if (track && deleteIds.has(track.id)) {
      player.pause()
    }
  }
}

function getTrackById(id, library, uploads) {
  return library[id] || uploads[id]
}

// TODO factor w waves-client-reducer
function shouldAddToDefaultPlaylist(playlistName) {
  return playlistName !== DEFAULT_PLAYLIST && playlistName != UPLOAD_PLAYLIST
}

function tracksDelete() {
  return async (dispatch, getState, { player, ws }) => {
    const { tracks } = getState()
    const { library, playing, playlists } = tracks
    const { selection } = playlists[FULL_PLAYLIST]
    const { track } = playing

    const deleteIds = Object.values(selection)
    const deleteTracks = deleteIds.map(deleteId => library[deleteId])
    const deletedTracks = await player.deleteTracks(deleteTracks)
    /* Only a subset of deleteIds may have been completed */
    const deletedIds = new Set(deletedTracks.filter(t => t != null).map(t => t.id))

    dispatch({ type: types.TRACKS_DELETE, deleteIds: deletedIds })
    ws.sendBestEffortMessage(types.TRACKS_DELETE, { deleteIds: [...deletedIds] })

    if (track && deletedIds.has(track.id)) {
      player.pause()
    }
  }
}


function updateLibraryById(libraryById, update) {
  for (const item of update) {
    addMissingTags(item)
    libraryById[item.id] = item
  }
  return libraryById
}

const TAGS_OF_INTEREST = ['title', 'artist', 'genre']

// TODO factor this out
function addMissingTags(item) {
  for (const tag of TAGS_OF_INTEREST) {
    item[tag] = item[tag] || (`Unknown ${tag}`)
  }
}

module.exports.trackToggle = trackToggle
module.exports.trackNext = trackNext
module.exports.trackPrevious = trackPrevious
module.exports.trackEnded = trackEnded
module.exports.trackUploadsUpdate = trackUploadsUpdate
module.exports.tracksUpdate = tracksUpdate
module.exports.tracksUpload = tracksUpload
module.exports.tracksDelete = tracksDelete

Object.assign(module.exports,
  require('./library'),
  require('./playing'),
  require('./playlists'),
  require('./sideEffects'),
  require('./uploads'))
