const types = require('waves-action-types')

const playing = require('./playing')
const playlists = require('./playlists')

const {
  NOW_PLAYING_NAME,
  LIBRARY_NAME,
  UPLOADS_NAME
} = require('waves-client-constants')
const {
  getOrCreatePlaylistSelectors,
  getPlaylistSelectors,
  getFilteredSelection,
  removeSelection
} = require('waves-client-selectors')
const { UploadError } = require('waves-client-errors')
const {
  getPlaylistNameFromRoute,
  normalizeTrack,
  shouldAddToDefaultPlaylist
} = require('waves-client-util')

const { toastErr, toastSuccess } = require('../toasts')

function getLibNameForPlaylistName(playlistName) {
  if (playlistName === UPLOADS_NAME) {
    return UPLOADS_NAME
  }
  return LIBRARY_NAME
}

function trackToggle(id, playlistName, index) {
  return (dispatch, getState, { player, ws }) => {
    const { tracks } = getState()
    const { libraries, playing } = tracks
    const libName = getLibNameForPlaylistName(playlistName)
    const track = libraries[libName][id]
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
        playlistName: NOW_PLAYING_NAME,
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
  const { libraries, playing, playlists } = state.tracks
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

function tracksAdd(update, libName) {
  return (dispatch, getState) => {
    const { tracks } = getState()
    const { libraries } = tracks
    const libraryById = { ...libraries[libName] }
    updateLibraryById(libraryById, update)
    dispatch({ type: types.TRACKS_ADD, lib: libraryById, libName })
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
        unprocessTrack(track)
        dispatch(toastSuccess(`Uploaded ${file.name}`))
        uploaded.push(track)
      } catch (err) {
        if (err instanceof UploadError) {
          dispatch(toastErr(`${err.track.file.name}: ${err.cause}`))
          console.log('Track upload failure')
          console.log(err)
          console.log(err.cause)
        } else {
          // Should not be reached
          dispatch(toastErr(`${err}`))
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
    const { playing, libraries, playlists } = tracks
    const { track } = playing
    const uploads = libraries[UPLOADS_NAME]
    const uploadIds = Object.keys(uploads)
    dispatch({
      type: types.TRACKS_INFO_UPDATE,
      ids: uploadIds,
      key: 'state',
      value: 'uploading',
      libName: UPLOADS_NAME
    })
    dispatch({
      type: types.TRACKS_INFO_UPDATE,
      ids: uploadIds,
      key: 'uploadProgress',
      value: 0,
      libName: UPLOADS_NAME
    })
    const uploadValues = Object.values(uploads)
    const uploadPromises = await player.upload(trackSource, uploadValues)
    const result = await handleUploadPromises(uploadPromises, dispatch)
    const { uploaded } = result
    try {
      await ws.sendAckedMessage(types.TRACKS_ADD, { tracks: uploaded })
    } catch (serverErr) {
      console.log('Failed to upload tracks to server')
      console.log(serverErr)
      dispatch(toastErr(`Upload failure: ${serverErr}`))
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
      type: types.TRACKS_DELETE,
      deleteIds: uploadedIds,
      libName: UPLOADS_NAME
    })
    dispatch(tracksAdd(uploaded, LIBRARY_NAME))
    return result
  }
}

function handleDeleteErr(err, dispatch) {
  const { track, code, message } = err
  const name = track.title || track.artist || track.album || track.genre
  dispatch(toastErr(`${name}: ${message}`))
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
          dispatch(toastSuccess(`Deleted ${name}`))
        }
      } catch (err) {
        serverErrs.push(err)
        dispatch(toastErr(`Delete failure: ${err}`))
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

function tracksDelete() {
  return async (dispatch, getState, { player, ws }) => {
    const state = getState()
    const { tracks } = state
    const { libraries, playing, playlists } = tracks
    const library = libraries[LIBRARY_NAME]
    const selection = getFilteredSelection(state, LIBRARY_NAME)

    const { track } = playing

    const deleteIds = Array.from(selection.values())
    dispatch({
      type: types.TRACKS_INFO_UPDATE,
      ids: deleteIds,
      key: 'state',
      value: 'pending',
      libName: LIBRARY_NAME
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
      dispatch(toastErr(`Delete failure: ${err}`))
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
      libName: LIBRARY_NAME
    })
    return result
  }
}

function trackUploadsDelete() {
  return (dispatch, getState, { player, ws }) => {
    const { playing, playlists } = getState().tracks
    const { track } = playing
    const playlist = playlists[UPLOADS_NAME]
    const { selection } = playlist
    const deleteIds = new Set(selection.values())
    if (track && deleteIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause()
    }
    dispatch({
      type: types.TRACKS_DELETE,
      deleteIds,
      libName: UPLOADS_NAME
    })
  }
}

function tracksRemove(playlistName) {
  return async (dispatch, getState, { player, ws }) => {
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
    await ws.sendAckedMessage(types.TRACKS_REMOVE, {
      playlistName,
      selection: [...removedSelection.entries()]
    })
  }
}

function updateLibraryById(libraryById, update) {
  for (const item of update) {
    addMissingTags(item)
    processTrack(item)
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

function playlistKeyDown(ev, history, dispatch, key, playlistName, props) {
  switch (key) {
    case 'h': {
      const { currentPage } = props
      if (currentPage < 1) {
        return
      }
      const { location } = history
      const { search, pathname } = history
      const qp = new URLSearchParams(search)
      qp.set('page', currentPage - 1)
      history.push({ pathname, search: qp.toString() })
      break
    }
    case 'l': {
      const { currentPage, lastPage } = props
      if (currentPage >= lastPage) {
        return
      }
      const { location } = history
      const { search, pathname } = history
      const qp = new URLSearchParams(search)
      qp.set('page', currentPage + 1)
      history.push({ pathname, search: qp.toString() })
      break
    }
    case 'k':
    case 'j': {
      const { displayItems, selection } = props
      const n = displayItems.length
      if (n === 0) {
        return
      }
      let i
      if (key === 'j') {
        i = n - 1
        if (selection.has(displayItems[i].index)) {
          return
        }
        while (i > 0) {
          i -= 1
          if (selection.has(displayItems[i].index)) {
            i += 1
            break
          }
        }
      } else {
        i = 0
        if (selection.has(displayItems[i].index)) {
          return
        }
        while (i < n - 1) {
          i += 1
          if (selection.has(displayItems[i].index)) {
            i -= 1
            break
          }
        }
      }
      dispatch(
        playlists.selectionClearAndAdd(
          playlistName,
          displayItems[i].index,
          displayItems[i].id,
          displayItems
        )
      )
      break
    }
    case ' ':
    case 'Enter': {
      const { displayItems, selection } = props
      if (displayItems.length === 0 || selection.size === 0) {
        return
      }
      for (const item of displayItems) {
        if (selection.has(item.index)) {
          if (key === ' ') {
            ev.preventDefault()
          }
          dispatch(trackToggle(item.id, playlistName, item.index))
        }
      }
    }
  }
}

function tracksKeyDown(ev, history) {
  return async (dispatch, getState, { player, ws }) => {
    const { key, target } = ev
    const { tagName, contentEditable } = target
    if (tagName === 'INPUT' || contentEditable === 'true') {
      return
    }

    switch (key) {
      case ' ': {
        const { track, isPlaying } = getState().tracks.playing
        if (track) {
          ev.preventDefault()
          if (isPlaying) {
            dispatch(playing.pause())
          } else {
            await dispatch(playing.play())
          }
          return
        }
        // Fall through (treat as track toggle)
      }
      case 'Enter':
      case 'j':
      case 'k':
      case 'h':
      case 'l': {
        const { location } = history
        const { search, pathname } = location
        const playlistName = getPlaylistNameFromRoute(pathname)
        if (!playlistName) {
          return
        }
        const playlistSelectors = getPlaylistSelectors(playlistName)
        if (!playlistSelectors) {
          return
        }
        const state = getState()
        const props = playlistSelectors.getPlaylistProps(state, search)
        if (!props.loaded) {
          return
        }
        playlistKeyDown(ev, history, dispatch, key, playlistName, props)
      }
    }
  }
}

function tracksLocalInfoUpdate(id, key, value, libName) {
  return { type: types.TRACKS_INFO_UPDATE, ids: [id], key, value, libName }
}

function tracksInfoUpdate(id, key, value, libName) {
  return async (dispatch, getState, { ws }) => {
    dispatch({ type: types.TRACKS_INFO_UPDATE, ids: [id], key, value, libName })
    try {
      await ws.sendAckedMessage(types.TRACKS_INFO_UPDATE, { id, key, value })
    } catch (err) {
      dispatch(toastErr(`${err}`))
    }
  }
}

function processTrack(track) {
  const epoch = parseInt(track.id.substring(0, 8), 16)
  track.createdAt = epoch
  track.createdAtPretty = new Date(epoch * 1000).toLocaleString()
}

function unprocessTrack(track) {
  delete track.createdAt
  delete track.createdAtPretty
}

module.exports.trackToggle = trackToggle
module.exports.trackNext = trackNext
module.exports.trackPrevious = trackPrevious
module.exports.trackEnded = trackEnded
module.exports.tracksAdd = tracksAdd
module.exports.tracksUpload = tracksUpload
module.exports.tracksDelete = tracksDelete
module.exports.trackUploadsDelete = trackUploadsDelete
module.exports.tracksRemove = tracksRemove
module.exports.tracksKeyDown = tracksKeyDown
module.exports.tracksLocalInfoUpdate = tracksLocalInfoUpdate
module.exports.tracksInfoUpdate = tracksInfoUpdate

Object.assign(module.exports, playing, playlists, require('./sideEffects'))
