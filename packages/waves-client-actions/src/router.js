const types = require('waves-action-types')
const { DEFAULT_PLAYLIST, FULL_PLAYLIST } = require('waves-client-constants')
const { getOrCreatePlaylistSelectors } = require('waves-client-selectors')

// TODO don't hardcode this
const DEFAULT_PLAYLIST_ROUTE = 'nowplaying'
const FULL_PLAYLIST_ROUTE = 'library'
const PLAYLIST_ROUTE = 'playlist'

function getPlaylistName(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  const { length } = parts
  if (length === 0) {
    return null
  }

  switch (parts[0]) {
    case DEFAULT_PLAYLIST_ROUTE:
      return DEFAULT_PLAYLIST
    case FULL_PLAYLIST_ROUTE:
      return FULL_PLAYLIST
    case PLAYLIST_ROUTE:
      return parts[1]
    default:
      return null
  }
}

function routerChange(location) {
  return async (dispatch, getState) => {
    const { pathname, search } = location
    const playlistName = getPlaylistName(pathname)

    if (!playlistName) {
      return
    }

    dispatch({ type: types.PLAYLIST_SEARCH_UPDATE, name: playlistName, search })

    if (playlistName === FULL_PLAYLIST) {
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
    }
  }
}

module.exports.routerChange = routerChange
