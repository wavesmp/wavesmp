const actionTypes = require('waves-action-types')
const { NOW_PLAYING_NAME } = require('waves-client-constants')
const { shouldAddToDefaultPlaylist } = require('waves-client-util')

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
        [name]: reducerSelection(playlist, action),
      }
    }

    case actionTypes.TRACKS_ADD: {
      const { lib, libName } = action
      const libPlaylistTracks = Object.keys(lib)
      let libPlaylist
      if (playlists && playlists[libName]) {
        libPlaylist = { ...playlists[libName] }
      } else {
        libPlaylist = getDefaultLibraryPlaylist(libName)
      }
      const { sortKey, ascending, index, selection } = libPlaylist
      const { newIndex, newSelection } = sortPlaylist(
        libPlaylistTracks,
        lib,
        sortKey,
        ascending,
        index,
        selection,
      )
      libPlaylist.tracks = libPlaylistTracks
      libPlaylist.index = newIndex
      libPlaylist.selection = newSelection

      return { ...playlists, [libName]: libPlaylist }
    }
    case actionTypes.PLAYLISTS_UPDATE: {
      const { update } = action
      const newPlaylists = { ...playlists }

      for (const newPlaylist of update) {
        const { name } = newPlaylist
        if (name in newPlaylists) {
          const playlist = newPlaylists[name]
          newPlaylists[name] = mergePlaylists(playlist, newPlaylist)
        } else {
          addPlaylistDefaults(newPlaylist)
          newPlaylists[name] = newPlaylist
        }
      }

      if (!newPlaylists[NOW_PLAYING_NAME]) {
        newPlaylists[NOW_PLAYING_NAME] = getDefaultPlaylist()
      }
      return newPlaylists
    }
    case actionTypes.TRACK_TOGGLE: {
      const { oldPlaylistName, playlistName, index, track } = action
      const { id, source } = track
      const newPlaylists = { ...playlists }

      /* Remove play id from old playlist, if it exists */
      const oldPlaylist = newPlaylists[oldPlaylistName]
      if (oldPlaylist) {
        newPlaylists[oldPlaylistName] = { ...oldPlaylist, index: null }
      }

      return trackNext(newPlaylists, playlistName, source, id, index)
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
      const { index, selection } = playlist
      const tracks = [...playlist.tracks]

      const { newIndex, newSelection } = sortPlaylist(
        tracks,
        lib,
        sortKey,
        ascending,
        index,
        selection,
      )
      return {
        ...playlists,
        [name]: {
          ...playlist,
          sortKey,
          ascending,
          tracks,
          index: newIndex,
          selection: newSelection,
        },
      }
    }
    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action
      const newPlaylists = {}
      for (const playlistName in playlists) {
        const playlist = playlists[playlistName]
        newPlaylists[playlistName] = tracksDeleteFromPlaylist(
          playlist,
          deleteIds,
        )
      }
      return newPlaylists
    }
    case actionTypes.PLAYLIST_ADD: {
      const { addTracks, playlistName } = action
      return {
        ...playlists,
        [playlistName]: playlistAdd(addTracks, playlistName, playlists),
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
          index: newIndex,
        },
      }
    }
    case actionTypes.PLAYLIST_MOVE: {
      const { src, dest } = action
      const newPlaylists = { ...playlists }
      newPlaylists[dest] = {
        ...playlists[src],
        name: dest,
      }
      delete newPlaylists[src]
      return newPlaylists
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
          index,
        },
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
      const newPlaylists = { ...playlists }
      delete newPlaylists[playlistName]
      if (!newPlaylists[NOW_PLAYING_NAME]) {
        newPlaylists[NOW_PLAYING_NAME] = getDefaultPlaylist()
      }
      return newPlaylists
    }
    default:
      return playlists
  }
}

function addPlaylistDefaults(playlist) {
  const { name } = playlist
  playlist.selection = new Map()
  playlist.search = initialPlaylistsSearch[name] || ''
  delete initialPlaylistsSearch[name]
  playlist.index = null
}

function mergeSelection(newTracks, selection) {
  const newSelection = new Map()
  for (const [index, id] of selection) {
    if (newTracks[index] === id) {
      newSelection.set(index, id)
    }
  }
  return newSelection
}

function mergePlaylists(playlist, newPlaylist) {
  const { index, selection, tracks } = playlist
  const { tracks: newTracks } = newPlaylist
  let newIndex = null
  if (index != null && tracks[index] === newTracks[index]) {
    newIndex = index
  }

  const newSelection = mergeSelection(newTracks, selection)
  return {
    ...playlist,
    tracks: newTracks,
    selection: newSelection,
    index: newIndex,
  }
}

/* Only library playlists support sorting */
function getDefaultLibraryPlaylist(playlistName) {
  const playlist = {
    name: playlistName,
    sortKey: initialPlaylistsSortKey[playlistName] || 'title',
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
    name: NOW_PLAYING_NAME,
    tracks: [],
  }
  addPlaylistDefaults(playlist)
  return playlist
}

function trackNext(newPlaylists, playlistName, source, id, index) {
  /* Add track to default playlist by default.
   * Unless it is part of certain playlists. */
  if (shouldAddToDefaultPlaylist(playlistName)) {
    const defaultPlaylist = newPlaylists[NOW_PLAYING_NAME]
    const { tracks } = defaultPlaylist
    newPlaylists[NOW_PLAYING_NAME] = {
      ...defaultPlaylist,
      tracks: [...tracks, id],
      index: tracks.length,
    }
  }

  /* Update playlist play id */
  newPlaylists[playlistName] = { ...newPlaylists[playlistName], index }
  return newPlaylists
}

function invert(m) {
  const inverted = new Map()
  for (const [k, v] of m) {
    inverted.set(v, k)
  }
  return inverted
}

function sortPlaylist(tracks, lib, sortKey, ascending, index, selection) {
  const factor = ascending ? 1 : -1
  const indexTrack = index != null && tracks[index]

  if (sortKey === 'duration' || sortKey === 'createdAt') {
    tracks.sort((a, b) => factor * (lib[a][sortKey] - lib[b][sortKey]))
  } else {
    tracks.sort((a, b) => {
      const valueA = (lib[a][sortKey] || '').toLowerCase()
      const valueB = (lib[b][sortKey] || '').toLowerCase()
      return factor * valueA.localeCompare(valueB)
    })
  }

  const resp = {}
  if (indexTrack) {
    // Possible to binary search here
    resp.newIndex = tracks.findIndex((track) => track === indexTrack)
  } else {
    resp.newIndex = null
  }

  if (selection.size) {
    const invertedSelection = invert(selection)
    const newSelection = new Map()
    const n = tracks.length
    for (let i = 0; i < n; i += 1) {
      const track = tracks[i]
      if (invertedSelection.has(track)) {
        newSelection.set(i, track)
      }
    }
    resp.newSelection = newSelection
  } else {
    resp.newSelection = selection
  }

  return resp
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
      tracks: addTracks,
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
    index,
  }
}

module.exports = reducerPlaylists
