const actionTypes = require('waves-action-types')
const { DEFAULT_PLAYLIST, FULL_PLAYLIST, UPLOAD_PLAYLIST } = require('waves-client-constants')

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

function addPlaylistDefaults(playlist) {
  playlist.selection = {},
  playlist.search = ''
  playlist.playId = null
}

/* Only library (full) playlist supports sorting */
function getDefaultLibraryPlaylist() {
  const playlist = {
    name: FULL_PLAYLIST,
    sortKey: 'title',
    ascending: true
  }
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
        libraryPlaylist = {...playlists[FULL_PLAYLIST]}
      } else {
        libraryPlaylist = getDefaultLibraryPlaylist()
      }
      const { sortKey, ascending, playId: oldPlayId } = libraryPlaylist
      const playId = sortLibraryPlaylist(
        libraryPlaylistTracks, libraryById, sortKey, ascending, oldPlayId)
      libraryPlaylist.tracks = libraryPlaylistTracks
      libraryPlaylist.playId = playId

      return {...playlists, [FULL_PLAYLIST]: libraryPlaylist}
    }
    case actionTypes.PLAYLISTS_UPDATE: {
      const { update } = action
      let playlistsUpdate = {...playlists}

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
      const playlistsUpdate = {...playlists}

      /* Remove play id from old playlist, if it exists*/
      const oldPlaylist = playlistsUpdate[oldPlaylistName]
      if (oldPlaylist) {
        playlistsUpdate[oldPlaylistName] = {...oldPlaylist, playId: null}
      }

      return trackNext(playlistsUpdate, playlistName, source, id, playId)
    }
    case actionTypes.TRACK_NEXT: {
      const { nextTrack, playlistName } = action
      if (!nextTrack) {
        return playlists
      }
      const { playId, source, id } = nextTrack
      return trackNext({...playlists}, playlistName, source, id, playId)
    }
    case actionTypes.PLAYLIST_SEARCH_UPDATE: {
      const { name, search } = action
      const playlist = playlists[name]
      return {...playlists, [name]: {...playlist, search}}
    }
    case actionTypes.PLAYLIST_SORT: {
      const { sortKey, ascending, library } = action
      const libraryPlaylist = playlists[FULL_PLAYLIST]
      const { playId: oldPlayId } = libraryPlaylist
      const tracks = [...libraryPlaylist.tracks]

      const playId = sortLibraryPlaylist(tracks, library, sortKey, ascending, oldPlayId)
      return {
        ...playlists,
        [FULL_PLAYLIST]: {...libraryPlaylist, sortKey, ascending, tracks, playId}
      }
    }
    case actionTypes.TRACK_UPLOADS_UPDATE: {
      const { update } = action
      const addTracks = update.map(t => t.id)
      const playlistName = UPLOAD_PLAYLIST

      // TODO refactor with PLAYLIST_ADD
      let playlistUpdate
      if (playlistName in playlists) {
        const playlist = playlists[playlistName]
        const { tracks } = playlist
        playlistUpdate = {...playlist, tracks: [...tracks, ...addTracks]}
      } else {
        playlistUpdate = {
          name: playlistName,
          tracks: addTracks,
        }
        addPlaylistDefaults(playlistUpdate)
      }

      return {
        ...playlists,
        [playlistName]: playlistUpdate
      }
    }
    case actionTypes.TRACK_UPLOADS_DELETE: {
      // TODO refactor with tracks delete
      // More like delete ids
      const { deleteIds } = action
      const playlistName = UPLOAD_PLAYLIST
      const playlist = playlists[playlistName]
      const { playId } = playlist
      let playIndex = getPlayIndex(playId)
      const tracks = [...playlist.tracks]
      const selection = {...playlist.selection}

      for (let i = tracks.length - 1; i >= 0; i -= 1) {
        const trackId = tracks[i]
        if (deleteIds.has(trackId)) {
          tracks.splice(i, 1)

          if (selection[i]) {
            delete selection[i]
          }

          if (playIndex != null) {
            if (playIndex === i) {
              playIndex = null
            } else if (playIndex > i) {
              playIndex -= 1
            }
          }
        }
      }
      return {
        ...playlists,
        [playlistName]: {
          ...playlist,
          selection,
          tracks,
          playId: playIndex != null ? (playIndex + '') : null
        }
      }
    }
    case actionTypes.PLAYLIST_ADD: {
      const { addTracks, playlistName } = action
      let playlistUpdate
      if (playlistName in playlists) {
        const playlist = playlists[playlistName]
        const { tracks } = playlist
        playlistUpdate = {...playlist, tracks: [...tracks, ...addTracks]}
      } else {
        playlistUpdate = {
          name: playlistName,
          tracks: addTracks,
        }
        addPlaylistDefaults(playlistUpdate)
      }

      return {
        ...playlists,
        [playlistName]: playlistUpdate
      }
    }
    case actionTypes.PLAYLIST_MOVE: {
      const { src, dest } = action
      const playlistsUpdate = {...playlists}
      playlistsUpdate[dest] = {
        ...playlists[src],
        name: dest
      }
      delete playlistsUpdate[src]
      return playlistsUpdate
    }
    case actionTypes.PLAYLIST_REMOVE: {
      const { deleteIndexes, playlistName } = action
      /* TODO Does not block from removing currently playing track */
      const playlist = playlists[playlistName]
      const tracks = [...playlist.tracks]
      const { playId } = playlist
      const playIndex = getPlayIndex(playId)
      let playIndexOffset = 0

      for (const deleteIndex of deleteIndexes) {
        if (playIndex != null && deleteIndex < playIndex) {
          playIndexOffset += 1
        }
        tracks.splice(deleteIndex, 1)
      }
      return {
        ...playlists,
        [playlistName]: {
          ...playlist,
          tracks,
          selection: {},
          playId: playIndex != null ? ((playIndex - playIndexOffset) + '') : null
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
      const playlistsUpdate = {...playlists}
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
        const { selection, tracks, playId } = playlist
        let playIndex = getPlayIndex(playId)

        let playIndexOffset = 0

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
                playIndexOffset += 1
              }
            }
          }
          return !isTrackDeleted
        })

        if (tracks.length !== filteredTracks.length) {
          playlistsUpdate[playlistName] = {
            ...playlist,
            tracks: filteredTracks,
            playId: playIndex != null ? ((playIndex - playIndexOffset) + '') : null,
            selection: {...selection}
          }
        } else {
          playlistsUpdate[playlistName] = playlist
        }
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
  playlistsUpdate[playlistName] = {...playlistsUpdate[playlistName], playId}
  return playlistsUpdate
}

function sortLibraryPlaylist(tracks, library, sortKey, ascending, oldPlayId) {
  const factor = ascending ? 1 : -1
  const oldPlayIndex = getPlayIndex(oldPlayId)
  const oldTrack = oldPlayIndex != null && tracks[oldPlayIndex]

  tracks.sort((a, b) => {
    const valueA = (library[a][sortKey] || '').toLowerCase()
    const valueB = (library[b][sortKey] || '').toLowerCase()
    return factor * valueA.localeCompare(valueB)
  })

  if (oldTrack) {
    // Possible to binary search here
    return '' + tracks.findIndex(track => track === oldTrack)
  }
  return oldPlayId
}

function getPlayIndex(playId) {
  return playId != null ? parseInt(playId) : null
}

// TODO factor w waves-client-actions
function shouldAddToDefaultPlaylist(playlistName) {
  return playlistName !== DEFAULT_PLAYLIST && playlistName != UPLOAD_PLAYLIST
}

module.exports = reducerPlaylists
