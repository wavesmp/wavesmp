const actionTypes = require('waves-action-types')
const {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  UPLOAD_PLAYLIST,
  libTypes
} = require('waves-client-constants')
const { shouldAddToDefaultPlaylist } = require('waves-client-util')

const reducerSelection = require('./selection')

const libTypeToPlaylistName = {
  [libTypes.WAVES]: FULL_PLAYLIST,
  [libTypes.UPLOADS]: UPLOAD_PLAYLIST
}

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

/* Only library playlists support sorting */
function getDefaultLibraryPlaylist(playlistName) {
  const playlist = {
    name: playlistName,
    sortKey: initialPlaylistsSortKey[playlistName] || 'title'
  }
  if (playlistName in initialPlaylistsAscending) {
    playlist.ascending = initialPlaylistsAscending[playlistName]
    delete initialPlaylistsAscending[playlistName]
  } else {
    playlist.ascending = true
  }
  delete initialPlaylistsSortKey[playlistName]
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

    case actionTypes.TRACKS_ADD: {
      const { lib, libType } = action
      const libPlaylistTracks = Object.keys(lib)
      const playlistName = libTypeToPlaylistName[libType]
      let libPlaylist
      if (playlists && playlists[playlistName]) {
        libPlaylist = { ...playlists[playlistName] }
      } else {
        libPlaylist = getDefaultLibraryPlaylist(playlistName)
      }
      const { sortKey, ascending, index: oldIndex } = libPlaylist
      const index = sortPlaylist(
        libPlaylistTracks,
        lib,
        sortKey,
        ascending,
        oldIndex
      )
      libPlaylist.tracks = libPlaylistTracks
      libPlaylist.index = index

      return { ...playlists, [playlistName]: libPlaylist }
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
      const { lib, name, sortKey, ascending } = action
      if (!lib || !playlists || !(name in playlists)) {
        initialPlaylistsAscending[name] = ascending
        initialPlaylistsSortKey[name] = sortKey
        return playlists
      }
      const playlist = playlists[name]
      const { index: oldIndex } = playlist
      const tracks = [...playlist.tracks]

      const index = sortPlaylist(tracks, lib, sortKey, ascending, oldIndex)
      return {
        ...playlists,
        [name]: { ...playlist, sortKey, ascending, tracks, index }
      }
    }
    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action
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
    case actionTypes.PLAYLIST_ADD: {
      const { addTracks, playlistName } = action
      return {
        ...playlists,
        [playlistName]: playlistAdd(addTracks, playlistName, playlists)
      }
    }
    case actionTypes.PLAYLIST_REORDER: {
      const { reordered, playlistName, newSelection, newIndex } = action
      return {
        ...playlists,
        [playlistName]: {
          ...playlists[playlistName],
          tracks: reordered,
          selection: newSelection,
          index: newIndex
        }
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
      const { deleteIndexes, playlistName, selection, index } = action
      const playlist = playlists[playlistName]
      const tracks = [...playlist.tracks]

      for (const deleteIndex of deleteIndexes) {
        tracks.splice(deleteIndex, 1)
      }
      return {
        ...playlists,
        [playlistName]: {
          ...playlist,
          tracks,
          selection,
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

function sortPlaylist(tracks, lib, sortKey, ascending, oldIndex) {
  const factor = ascending ? 1 : -1
  const oldTrack = oldIndex != null && tracks[oldIndex]

  if (sortKey === 'duration' || sortKey === 'createdAt') {
    tracks.sort((a, b) => factor * (lib[a][sortKey] - lib[b][sortKey]))
  } else {
    tracks.sort((a, b) => {
      const valueA = (lib[a][sortKey] || '').toLowerCase()
      const valueB = (lib[b][sortKey] || '').toLowerCase()
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

module.exports = reducerPlaylists
