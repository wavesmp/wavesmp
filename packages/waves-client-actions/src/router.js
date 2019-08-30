const types = require('waves-action-types')
const {
  LIBRARY_NAME,
  UPLOADS_NAME,
  libTypes
} = require('waves-client-constants')
const { getOrCreatePlaylistSelectors } = require('waves-client-selectors')
const { getPlaylistNameFromRoute } = require('waves-client-util')

const playlistNameToLibType = {
  [LIBRARY_NAME]: libTypes.WAVES,
  [UPLOADS_NAME]: libTypes.UPLOADS
}

function routerChange(location) {
  return async (dispatch, getState) => {
    const { pathname, search } = location
    const playlistName = getPlaylistNameFromRoute(pathname)
    if (!playlistName) {
      return
    }
    dispatch({
      type: types.PLAYLIST_SEARCH_UPDATE,
      name: playlistName,
      search
    })
    if (playlistName in playlistNameToLibType) {
      const libType = playlistNameToLibType[playlistName]
      const {
        getRouterAscending,
        getRouterSortKey
      } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams, libType)
      const ascending = getRouterAscending(undefined, search)
      const sortKey = getRouterSortKey(undefined, search)
      const { libraries, playlists } = getState().tracks
      const lib = libraries[libType]
      const playlist = playlists && playlists[playlistName]
      if (
        lib &&
        playlist &&
        sortKey === playlist.sortKey &&
        ascending === playlist.ascending
      ) {
        return
      }
      dispatch({
        type: types.PLAYLIST_SORT,
        lib,
        name: playlistName,
        sortKey,
        ascending
      })
    }
  }
}

module.exports.routerChange = routerChange
