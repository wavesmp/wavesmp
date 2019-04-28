const types = require('waves-action-types')
const {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  UPLOAD_PLAYLIST,
  toastTypes
} = require('waves-client-constants')
const {
  getOrCreatePlaylistSelectors,
  getFilteredSelection,
  removeSelection
} = require('waves-client-selectors')
const { UploadError } = require('waves-client-errors')
const {
  normalizeTrack,
  shouldAddToDefaultPlaylist
} = require('waves-client-util')

const { toastAdd } = require('../toasts')

function trackToggle(id, playlistName, index) {
  return (dispatch, getState, { player, ws }) => {
    const { tracks } = getState()
    const { library, playing, uploads } = tracks

    const track = getTrackById(id, library, uploads)
    const { playlist: oldPlaylistName } = playing

    player.trackToggle(track)
    dispatch({
      type: types.TRACK_TOGGLE,
      playlistName,
      index,
      track,
      oldPlaylistName
    })

    /* By default, playing a track adds it to the default playlist.
     * Unless, it it part of certain playlists */
    if (shouldAddToDefaultPlaylist(playlistName)) {
      ws.sendBestEffortMessage(types.PLAYLIST_ADD, {
        playlistName: DEFAULT_PLAYLIST,
        trackIds: [id]
      })
    }
  }
}

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
    const { tracks } = getState()
    const { playing } = tracks
    const { repeat } = playing

    if (repeat) {
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
  const { library, playing, playlists, uploads } = state.tracks
  const { playlist: playlistName, isPlaying, shuffle } = playing
  const playlist = playlists[playlistName]

  const { getSearchItems } = getOrCreatePlaylistSelectors(
    playlistName,
    URLSearchParams
  )
  const searchItems = getSearchItems(state, playlist.search)
  const nextTrack = getNextTrack(
    searchItems,
    playlist,
    shuffle,
    prev,
    library,
    uploads
  )

  dispatch({
    type: types.TRACK_NEXT,
    nextTrack,
    playlistName
  })
  if (nextTrack) {
    if (shouldAddToDefaultPlaylist(playlistName)) {
      ws.sendBestEffortMessage(types.PLAYLIST_ADD, {
        playlistName: DEFAULT_PLAYLIST,
        trackIds: [nextTrack.id]
      })
    }
    try {
      await player.trackNext(nextTrack, isPlaying)
    } catch (err) {
      toastAdd({ type: toastTypes.Error, msg: err.toString() })(dispatch)
    }
  } else {
    player.pause()
    player.seek(0)
  }
}

function getNextTrack(searchItems, playlist, shuffle, prev, library, uploads) {
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
    const track = getTrackById(trackId, library, uploads)
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
    const track = getTrackById(trackId, library, uploads)
    return normalizeTrack(track, nextIndex)
  }
  if (!prev && index < length - 1) {
    const nextIndex = index + 1
    const trackId = items[nextIndex]
    const track = getTrackById(trackId, library, uploads)
    return normalizeTrack(track, nextIndex)
  }
  return null
}

function trackUploadsUpdate(update) {
  return { type: types.TRACK_UPLOADS_UPDATE, update }
}

function tracksUpdate(update) {
  return (dispatch, getState) => {
    const { tracks } = getState()
    const { library } = tracks
    const libraryById = { ...library }
    updateLibraryById(libraryById, update)
    dispatch({ type: types.TRACKS_UPDATE, libraryById })
  }
}

async function handleUploadPromises(promises, dispatch) {
  const uploaded = []
  const uploadErrs = []
  await Promise.all(
    promises.map(async promise => {
      try {
        const track = await promise
        const { file } = track
        delete track.file
        toastAdd({ type: toastTypes.Success, msg: `Uploaded ${file.name}` })(
          dispatch
        )
        uploaded.push(track)
      } catch (err) {
        if (err instanceof UploadError) {
          toastAdd({
            type: toastTypes.Error,
            msg: `${err.track.file.name}: ${err.cause}`
          })(dispatch)
          console.log('Track upload failure')
          console.log(err)
          console.log(err.cause)
        } else {
          // Should not be reached. Here temporarily
          toastAdd({ type: toastTypes.Error, msg: err.toString() })
          console.log('Expected upload error but got:')
          console.log(err)
        }
        uploadErrs.push(err)
      }
    })
  )
  return { uploaded, uploadErrs }
}

function tracksUpload(trackSource) {
  return async (dispatch, getState, { player, ws }) => {
    const { tracks } = getState()
    const { playing, uploads, playlists } = tracks
    const { track } = playing
    const uploadIds = Object.keys(uploads)
    dispatch({
      type: types.UPLOAD_TRACKS_UPDATE,
      ids: uploadIds,
      key: 'state',
      value: 'uploading'
    })
    dispatch({
      type: types.UPLOAD_TRACKS_UPDATE,
      ids: uploadIds,
      key: 'uploadProgress',
      value: 0
    })
    const uploadValues = Object.values(uploads)
    const uploadPromises = await player.upload(trackSource, uploadValues)
    const result = await handleUploadPromises(uploadPromises, dispatch)
    const { uploaded } = result
    try {
      await ws.sendAckedMessage(types.TRACKS_UPDATE, { tracks: uploaded })
    } catch (serverErr) {
      console.log('Failed to upload tracks to server')
      console.log(serverErr)
      toastAdd({ type: toastTypes.Error, msg: `Upload failure: ${serverErr}` })(
        dispatch
      )
      result.serverErr = serverErr
      return result
    }
    const uploadedIds = new Set(uploaded.map(t => t.id))
    if (track && uploadedIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause()
    }
    dispatch({
      type: types.TRACK_UPLOADS_DELETE,
      deleteIds: uploadedIds,
      playlist: tracksDeleteFromPlaylist(
        playlists[UPLOAD_PLAYLIST],
        uploadedIds
      )
    })
    tracksUpdate(uploaded)(dispatch, getState)
    return result
  }
}

function getTrackById(id, library, uploads) {
  return library[id] || uploads[id]
}

function handleDeleteErr(err, dispatch) {
  const { track, code, message } = err
  const name = track.title || track.artist || track.album || track.genre
  toastAdd({ type: toastTypes.Error, msg: `${name}: ${message}` })(dispatch)
  console.log(`Failed to delete track ${name}: ${code} - ${message}`)
}

async function handleDeletePromises(promises, dispatch) {
  const allDeleted = []
  const allDeleteErrs = []
  const serverErrs = []
  await Promise.all(
    promises.map(async promise => {
      try {
        const { deleted, deleteErrs } = await promise
        Array.prototype.push.apply(allDeleted, deleted)
        Array.prototype.push.apply(allDeleteErrs, deleteErrs)

        for (const err of deleteErrs) {
          handleDeleteErr(err, dispatch)
        }
        for (const track of deleted) {
          toastAdd({ type: toastTypes.Success, msg: `Deleted ${name}` })(
            dispatch
          )
        }
      } catch (err) {
        serverErrs.push(err)
        toastAdd({ type: toastTypes.Error, msg: `Delete failure: ${err}` })(
          dispatch
        )
        console.log('Error deleting from server:')
        console.log(err)
      }
    })
  )
  return {
    deleted: allDeleted,
    deleteErrs: allDeleteErrs,
    serverErrs
  }
}

function tracksDeleteFromPlaylists(playlists, deleteIds) {
  const playlistsUpdate = {}
  for (const playlistName in playlists) {
    const playlist = playlists[playlistName]
    playlistsUpdate[playlistName] = tracksDeleteFromPlaylist(
      playlist,
      deleteIds
    )
  }
  return playlistsUpdate
}

function tracksDeleteFromPlaylist(playlist, deleteIds) {
  const { selection, tracks } = playlist
  let { index } = playlist

  const filteredSelection = new Map()
  const filteredTracks = []

  let numDeleted = 0
  let indexOffset = 0
  for (let i = 0; i < tracks.length; i += 1) {
    const track = tracks[i]
    if (deleteIds.has(track)) {
      if (index != null) {
        if (i === index) {
          index = null
        } else if (i < index) {
          indexOffset += 1
        }
      }
      numDeleted += 1
    } else {
      filteredTracks.push(track)
      if (selection.has(i)) {
        filteredSelection.set(i - numDeleted, track)
      }
    }
  }

  if (index) {
    index -= indexOffset
  }

  return {
    ...playlist,
    selection: filteredSelection,
    tracks: filteredTracks,
    index
  }
}

function tracksDelete() {
  return async (dispatch, getState, { player, ws }) => {
    const state = getState()
    const { tracks } = state
    const { library, playing, playlists } = tracks
    const selection = getFilteredSelection(state, FULL_PLAYLIST)

    const { track } = playing

    const deleteIds = Array.from(selection.values())
    dispatch({
      type: types.LIBRARY_TRACK_UPDATE,
      ids: deleteIds,
      key: 'state',
      value: 'pending'
    })
    const deleteTracks = deleteIds.map(deleteId => library[deleteId])
    const deletePromises = await player.deleteTracks(deleteTracks)
    const result = await handleDeletePromises(deletePromises, dispatch)
    const { deleted } = result
    const deletedIds = new Set(deleted.map(t => t.id))

    try {
      await ws.sendAckedMessage(types.TRACKS_DELETE, {
        deleteIds: [...deletedIds]
      })
    } catch (err) {
      toastAdd({ type: toastTypes.Error, msg: `Delete failure: ${err}` })(
        dispatch
      )
      result.serverErrs.push(err)
      console.log('Failed to delete tracks from server')
      console.log(err)
      return result
    }

    if (track && deletedIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause()
    }
    dispatch({
      type: types.TRACKS_DELETE,
      deleteIds: deletedIds,
      playlists: tracksDeleteFromPlaylists(playlists, deletedIds)
    })

    return result
  }
}

function tracksRemove(playlistName) {
  return (dispatch, getState, { player, ws }) => {
    console.log(`Removing from playlist ${playlistName}`)
    const state = getState()
    const { tracks } = state
    const { playing } = tracks
    const {
      oldIndex,
      removedSelection,
      updatedSelection,
      index
    } = removeSelection(state, playlistName)

    // Removed selection keys should be in order
    const deleteIndexes = Array.from(removedSelection.keys())

    deleteIndexes.reverse()
    const deletePlaying =
      playing.playlist === playlistName &&
      playing.track &&
      playing.track.id === removedSelection.get(oldIndex)

    if (deletePlaying) {
      player.pause()
    }

    dispatch({
      type: types.TRACKS_REMOVE,
      playlistName,
      deleteIndexes,
      selection: updatedSelection,
      index,
      deletePlaying
    })
    ws.sendBestEffortMessage(types.TRACKS_REMOVE, {
      playlistName,
      deleteIndexes
    })
  }
}

function updateLibraryById(libraryById, update) {
  for (const item of update) {
    addMissingTags(item)
    const epoch = parseInt(item.id.substring(0, 8), 16)
    item.createdAt = epoch
    item.createdAtPretty = new Date(epoch * 1000).toLocaleString()
    libraryById[item.id] = item
  }
  return libraryById
}

const TAGS_OF_INTEREST = ['title', 'artist', 'genre']

function addMissingTags(item) {
  for (const tag of TAGS_OF_INTEREST) {
    item[tag] = item[tag] || `Unknown ${tag}`
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
module.exports.tracksRemove = tracksRemove

Object.assign(
  module.exports,
  require('./library'),
  require('./playing'),
  require('./playlists'),
  require('./sideEffects'),
  require('./uploads')
)
