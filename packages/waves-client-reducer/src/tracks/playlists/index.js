const actionTypes = require('waves-action-types')
const {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  UPLOAD_PLAYLIST
} = require('waves-client-constants')

const reducerSelection = require('./selection')

/* Maps playlist names to playlists. Playlists contain:
 * - name
 * - tracks
 * - selection (initialized to empty object)
 * - search - undefined by default. React router url query params
 * - playId - undefined by default
 * - ascending - (optional) undefined by default
 * - sortKey - (optional) undefined by default
 */
const initialPlaylists = null

/* Search/sort may have been specified before playlist
 * has even loaded. Cache values until load time */
const initialPlaylistsSearch = {}
const initialPlaylistsSortKey = {}
const initialPlaylistsAscending = {}

function addPlaylistDefaults(playlist) {
  const { name } = playlist
  playlist.selection = {}
  playlist.search = initialPlaylistsSearch[name] || ''
  delete initialPlaylistsSearch[name]
  playlist.playId = null
}

/* Only library (full) playlist supports sorting */
function getDefaultLibraryPlaylist() {
  const playlist = {
    name: FULL_PLAYLIST,
    sortKey: initialPlaylistsSortKey[FULL_PLAYLIST] || 'title'
  }
  if (FULL_PLAYLIST in initialPlaylistsAscending) {
    playlist.ascending = initialPlaylistsAscending[FULL_PLAYLIST]
    delete initialPlaylistsAscending[FULL_PLAYLIST]
  } else {
    playlist.ascending = true
  }
  delete initialPlaylistsSortKey[FULL_PLAYLIST]
  addPlaylistDefaults(playlist)
  return playlist
}

function getDefaultPlaylist() {
  const playlist = {
    name: DEFAULT_PLAYLIST,
    tracks: []
  }
  addPlaylistDefaults(playlist)
  return playlist
}

function reducerPlaylists(playlists = initialPlaylists, action) {
  switch (action.type) {
    case actionTypes.SELECTION_ADD:
    case actionTypes.SELECTION_RANGE:
    case actionTypes.SELECTION_REMOVE:
    case actionTypes.SELECTION_CLEAR_AND_ADD:
    case actionTypes.SELECTION_CLEAR: {
      const { name } = action
      const playlist = playlists[name]
      return {
        ...playlists,
        [name]: reducerSelection[action.type](playlist, action)
      }
    }

    case actionTypes.TRACKS_UPDATE: {
      const { libraryById } = action
      const libraryPlaylistTracks = Object.keys(libraryById)
      let libraryPlaylist
      if (playlists && playlists[FULL_PLAYLIST]) {
        libraryPlaylist = { ...playlists[FULL_PLAYLIST] }
      } else {
        libraryPlaylist = getDefaultLibraryPlaylist()
      }
      const { sortKey, ascending, playId: oldPlayId } = libraryPlaylist
      const playId = sortPlaylist(
        libraryPlaylistTracks,
        libraryById,
        sortKey,
        ascending,
        oldPlayId
      )
      libraryPlaylist.tracks = libraryPlaylistTracks
      libraryPlaylist.playId = playId

      return { ...playlists, [FULL_PLAYLIST]: libraryPlaylist }
    }
    case actionTypes.PLAYLISTS_UPDATE: {
      const { update } = action
      let playlistsUpdate = { ...playlists }

      for (const playlist of update) {
        addPlaylistDefaults(playlist)
        playlistsUpdate[playlist.name] = playlist
      }

      if (!playlistsUpdate[DEFAULT_PLAYLIST]) {
        playlistsUpdate[DEFAULT_PLAYLIST] = getDefaultPlaylist()
      }
      return playlistsUpdate
    }
    case actionTypes.TRACK_TOGGLE: {
      const { oldPlaylistName, playlistName, playId, track } = action
      const { id, source } = track
      const playlistsUpdate = { ...playlists }

      /* Remove play id from old playlist, if it exists*/
      const oldPlaylist = playlistsUpdate[oldPlaylistName]
      if (oldPlaylist) {
        playlistsUpdate[oldPlaylistName] = { ...oldPlaylist, playId: null }
      }

      return trackNext(playlistsUpdate, playlistName, source, id, playId)
    }
    case actionTypes.TRACK_NEXT: {
      const { nextTrack, playlistName } = action
      if (!nextTrack) {
        return playlists
      }
      const { playId, source, id } = nextTrack
      return trackNext({ ...playlists }, playlistName, source, id, playId)
    }
    case actionTypes.PLAYLIST_SEARCH_UPDATE: {
      const { name, search } = action
      if (!playlists || !(name in playlists)) {
        initialPlaylistsSearch[name] = search
        return playlists
      }
      const playlist = playlists[name]
      if (search === playlist.search) {
        return playlists
      }
      return { ...playlists, [name]: { ...playlist, search } }
    }
    case actionTypes.PLAYLIST_SORT: {
      const { library, name, sortKey, ascending } = action
      if (!library || !playlists || !(name in playlists)) {
        initialPlaylistsAscending[name] = ascending
        initialPlaylistsSortKey[name] = sortKey
        return playlists
      }
      const playlist = playlists[name]
      if (sortKey === playlist.sortKey && ascending === playlist.ascending) {
        return playlists
      }
      const { playId: oldPlayId } = playlist
      const tracks = [...playlist.tracks]

      const playId = sortPlaylist(
        tracks,
        library,
        sortKey,
        ascending,
        oldPlayId
      )
      return {
        ...playlists,
        [name]: { ...playlist, sortKey, ascending, tracks, playId }
      }
    }
    case actionTypes.TRACK_UPLOADS_UPDATE: {
      const { update } = action
      const addTracks = update.map(t => t.id)
      const playlistName = UPLOAD_PLAYLIST
      return {
        ...playlists,
        [playlistName]: playlistAdd(addTracks, playlistName, playlists)
      }
    }
    case actionTypes.TRACK_UPLOADS_DELETE: {
      const { deleteIds } = action
      const playlistName = UPLOAD_PLAYLIST
      const playlist = playlists[playlistName]

      return { ...playlists, [playlistName]: tracksDelete(playlist, deleteIds) }
    }
    case actionTypes.PLAYLIST_ADD: {
      const { addTracks, playlistName } = action
      return {
        ...playlists,
        [playlistName]: playlistAdd(addTracks, playlistName, playlists)
      }
    }
    case actionTypes.PLAYLIST_MOVE: {
      const { src, dest } = action
      const playlistsUpdate = { ...playlists }
      playlistsUpdate[dest] = {
        ...playlists[src],
        name: dest
      }
      delete playlistsUpdate[src]
      return playlistsUpdate
    }
    case actionTypes.TRACKS_REMOVE: {
      const { deleteIndexes, playlistName } = action
      const playlist = playlists[playlistName]
      const tracks = [...playlist.tracks]
      const { playId } = playlist
      let playIndex = getPlayIndex(playId)

      for (const deleteIndex of deleteIndexes) {
        if (playIndex != null) {
          if (deleteIndex === playIndex) {
            playIndex = null
          } else if (deleteIndex < playIndex) {
            playIndex -= 1
          }
        }
        tracks.splice(deleteIndex, 1)
      }
      return {
        ...playlists,
        [playlistName]: {
          ...playlist,
          tracks,
          selection: {},
          playId: playIndex != null ? playIndex + '' : null
        }
      }
    }
    case actionTypes.PLAYLIST_COPY: {
      const { src, dest } = action
      const copyPlaylist = { name: dest, tracks: [...playlists[src].tracks] }
      addPlaylistDefaults(copyPlaylist)
      return { ...playlists, [dest]: copyPlaylist }
    }
    case actionTypes.PLAYLIST_DELETE: {
      const { playlistName } = action
      const playlistsUpdate = { ...playlists }
      delete playlistsUpdate[playlistName]
      if (!playlistsUpdate[DEFAULT_PLAYLIST]) {
        playlistsUpdate[DEFAULT_PLAYLIST] = getDefaultPlaylist()
      }
      return playlistsUpdate
    }
    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action
      const playlistsUpdate = {}
      for (const playlistName in playlists) {
        const playlist = playlists[playlistName]
        playlistsUpdate[playlistName] = tracksDelete(playlist, deleteIds)
      }

      return playlistsUpdate
    }
    default:
      return playlists
  }
}

function trackNext(playlistsUpdate, playlistName, source, id, playId) {
  /* Add track to default playlist by default.
   * Unless it is part of certain playlists. */
  if (shouldAddToDefaultPlaylist(playlistName)) {
    const defaultPlaylist = playlistsUpdate[DEFAULT_PLAYLIST]
    const { tracks } = defaultPlaylist
    playlistsUpdate[DEFAULT_PLAYLIST] = {
      ...defaultPlaylist,
      tracks: [...tracks, id],
      playId: tracks.length + ''
    }
  }

  /* Update playlist play id */
  playlistsUpdate[playlistName] = { ...playlistsUpdate[playlistName], playId }
  return playlistsUpdate
}

function sortPlaylist(tracks, library, sortKey, ascending, oldPlayId) {
  const factor = ascending ? 1 : -1
  const oldPlayIndex = getPlayIndex(oldPlayId)
  const oldTrack = oldPlayIndex != null && tracks[oldPlayIndex]

  if (sortKey === 'duration') {
    tracks.sort((a, b) => factor * (library[a][sortKey] - library[b][sortKey]))
  } else {
    tracks.sort((a, b) => {
      const valueA = (library[a][sortKey] || '').toLowerCase()
      const valueB = (library[b][sortKey] || '').toLowerCase()
      return factor * valueA.localeCompare(valueB)
    })
  }

  if (oldTrack) {
    // Possible to binary search here
    return '' + tracks.findIndex(track => track === oldTrack)
  }
  return oldPlayId
}

function playlistAdd(addTracks, playlistName, playlists) {
  let playlistUpdate
  if (playlistName in playlists) {
    const playlist = playlists[playlistName]
    const { tracks } = playlist
    playlistUpdate = { ...playlist, tracks: tracks.concat(addTracks) }
  } else {
    playlistUpdate = {
      name: playlistName,
      tracks: addTracks
    }
    addPlaylistDefaults(playlistUpdate)
  }
  return playlistUpdate
}

function tracksDelete(playlist, deleteIds) {
  const { selection, tracks, playId } = playlist
  let playIndex = getPlayIndex(playId)

  const filteredTracks = tracks.filter((t, i) => {
    const isTrackDeleted = deleteIds.has(t)
    if (isTrackDeleted) {
      if (i in selection) {
        delete selection[i]
      }
      if (playIndex != null) {
        if (i === playIndex) {
          /* Track is deleted. Playlist is no longer playing item */
          playIndex = null
        } else if (i < playIndex) {
          playIndex -= 1
        }
      }
    }
    return !isTrackDeleted
  })

  if (tracks.length !== filteredTracks.length) {
    return {
      ...playlist,
      tracks: filteredTracks,
      playId: playIndex != null ? playIndex + '' : null,
      selection: { ...selection }
    }
  }
  return playlist
}

function getPlayIndex(playId) {
  return playId != null ? parseInt(playId) : null
}

// TODO factor w waves-client-actions
function shouldAddToDefaultPlaylist(playlistName) {
  return playlistName !== DEFAULT_PLAYLIST && playlistName != UPLOAD_PLAYLIST
}

module.exports = reducerPlaylists
