const types = require('waves-action-types')
const {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  routes
} = require('waves-client-constants')
const { getOrCreatePlaylistSelectors } = require('waves-client-selectors')

function routerChange(location) {
  return async (dispatch, getState) => {
    const { pathname, search } = location
    if (pathname === routes.nowplaying) {
      dispatch({
        type: types.PLAYLIST_SEARCH_UPDATE,
        name: DEFAULT_PLAYLIST,
        search
      })
    } else if (pathname === routes.library) {
      dispatch({
        type: types.PLAYLIST_SEARCH_UPDATE,
        name: FULL_PLAYLIST,
        search
      })
      const {
        getRouterAscending,
        getRouterSortKey
      } = getOrCreatePlaylistSelectors(FULL_PLAYLIST, URLSearchParams)
      const ascending = getRouterAscending(undefined, search)
      const sortKey = getRouterSortKey(undefined, search)
      const { library } = getState().tracks
      dispatch({
        type: types.PLAYLIST_SORT,
        library,
        name: FULL_PLAYLIST,
        sortKey,
        ascending
      })
    } else if (pathname.startsWith(routes.playlistBase)) {
      const playlistName = pathname.slice(routes.playlistBase.length)
      dispatch({
        type: types.PLAYLIST_SEARCH_UPDATE,
        name: playlistName,
        search
      })
    }
  }
}

module.exports.routerChange = routerChange
