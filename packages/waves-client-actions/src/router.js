const types = require('waves-action-types')
const { FULL_PLAYLIST } = require('waves-client-constants')
const { getOrCreatePlaylistSelectors } = require('waves-client-selectors')
const { getPlaylistNameFromRoute } = require('waves-client-util')

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
    if (playlistName === FULL_PLAYLIST) {
      const {
        getRouterAscending,
        getRouterSortKey
      } = getOrCreatePlaylistSelectors(FULL_PLAYLIST, URLSearchParams)
      const ascending = getRouterAscending(undefined, search)
      const sortKey = getRouterSortKey(undefined, search)
      const { library, playlists } = getState().tracks
      const playlist = playlists && playlists[FULL_PLAYLIST]
      if (
        library &&
        playlist &&
        sortKey === playlist.sortKey &&
        ascending === playlist.ascending
      ) {
        return
      }
      dispatch({
        type: types.PLAYLIST_SORT,
        library,
        name: FULL_PLAYLIST,
        sortKey,
        ascending
      })
    }
  }
}

module.exports.routerChange = routerChange
