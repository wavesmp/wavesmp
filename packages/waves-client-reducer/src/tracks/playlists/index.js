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
 * - index - undefined by default
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
  playlist.selection = new Map()
  playlist.search = initialPlaylistsSearch[name] || ''
  delete initialPlaylistsSearch[name]
  playlist.index = null
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
      const { sortKey, ascending, index: oldIndex } = libraryPlaylist
      const index = sortPlaylist(
        libraryPlaylistTracks,
        libraryById,
        sortKey,
        ascending,
        oldIndex
      )
      libraryPlaylist.tracks = libraryPlaylistTracks
      libraryPlaylist.index = index

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
      const { oldPlaylistName, playlistName, index, track } = action
      const { id, source } = track
      const playlistsUpdate = { ...playlists }

      /* Remove play id from old playlist, if it exists*/
      const oldPlaylist = playlistsUpdate[oldPlaylistName]
      if (oldPlaylist) {
        playlistsUpdate[oldPlaylistName] = { ...oldPlaylist, index: null }
      }

      return trackNext(playlistsUpdate, playlistName, source, id, index)
    }
    case actionTypes.TRACK_NEXT: {
      const { nextTrack, playlistName } = action
      if (!nextTrack) {
        return playlists
      }
      const { index, source, id } = nextTrack
      return trackNext({ ...playlists }, playlistName, source, id, index)
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
      const { index: oldIndex } = playlist
      const tracks = [...playlist.tracks]

      const index = sortPlaylist(tracks, library, sortKey, ascending, oldIndex)
      return {
        ...playlists,
        [name]: { ...playlist, sortKey, ascending, tracks, index }
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
      let { index } = playlist

      for (const deleteIndex of deleteIndexes) {
        if (index != null) {
          if (deleteIndex === index) {
            index = null
          } else if (deleteIndex < index) {
            index -= 1
          }
        }
        tracks.splice(deleteIndex, 1)
      }
      return {
        ...playlists,
        [playlistName]: {
          ...playlist,
          tracks,
          // TODO does selection really need to be cleared?
          selection: new Map(),
          index
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

function trackNext(playlistsUpdate, playlistName, source, id, index) {
  /* Add track to default playlist by default.
   * Unless it is part of certain playlists. */
  if (shouldAddToDefaultPlaylist(playlistName)) {
    const defaultPlaylist = playlistsUpdate[DEFAULT_PLAYLIST]
    const { tracks } = defaultPlaylist
    playlistsUpdate[DEFAULT_PLAYLIST] = {
      ...defaultPlaylist,
      tracks: [...tracks, id],
      index: tracks.length
    }
  }

  /* Update playlist play id */
  playlistsUpdate[playlistName] = { ...playlistsUpdate[playlistName], index }
  return playlistsUpdate
}

function sortPlaylist(tracks, library, sortKey, ascending, oldIndex) {
  const factor = ascending ? 1 : -1
  const oldTrack = oldIndex != null && tracks[oldIndex]

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
    return tracks.findIndex(track => track === oldTrack)
  }
  return oldIndex
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
  const { selection, tracks } = playlist
  let { index } = playlist

  const filteredTracks = tracks.filter((t, i) => {
    const isTrackDeleted = deleteIds.has(t)
    if (isTrackDeleted) {
      if (index != null) {
        if (i === index) {
          /* Track is deleted. Playlist is no longer playing item */
          index = null
        } else if (i < index) {
          index -= 1
        }
      }
    }
    return !isTrackDeleted
  })

  if (tracks.length !== filteredTracks.length) {
    return {
      ...playlist,
      tracks: filteredTracks,
      index,
      // TODO does selection really need to be cleared?
      selection: new Map()
    }
  }
  return playlist
}

// TODO factor w waves-client-actions
function shouldAddToDefaultPlaylist(playlistName) {
  return playlistName !== DEFAULT_PLAYLIST && playlistName != UPLOAD_PLAYLIST
}

module.exports = reducerPlaylists
