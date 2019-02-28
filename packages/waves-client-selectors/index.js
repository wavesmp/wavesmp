const formatTime = require('format-duration')
const { createSelector } = require('reselect')

const { DEFAULT_PLAYLIST, FULL_PLAYLIST } = require('waves-client-constants')

const trackSearch = require('./trackSearch')

const ORDER_QUERY_KEY = 'order'
const SEARCH_QUERY_KEY = 'search'
const SORT_KEY_QUERY_KEY = 'sortKey'

const DEFAULT_ASCENDING = true
const DEFAULT_SORT_KEY = 'title'

const getLibrary = tracks => tracks.library
const getPlaylists = tracks => tracks.playlists

const playlistSelectors = {}
function getOrCreatePlaylistSelectors(playlistName, URLSearchParams) {
  let playlistSelector = playlistSelectors[playlistName]
  if (!playlistSelector) {
    playlistSelector = createPlaylistSelectors(playlistName, URLSearchParams)
    playlistSelectors[playlistName] = playlistSelector
  }
  return playlistSelector
}

/* playlists selector creator */
function createPlaylistSelectors(playlistName, URLSearchParams) {
  /* router query params */
  function _getRouterQueryParams(search) {
    if (!search) {
      return null
    }
    return new URLSearchParams(search)
  }

  const getRouterQueryParams = createSelector(
    [(_, search) => search],
    _getRouterQueryParams
  )

  /* router search string
   *
   * Router search string is directly used in the view, but router
   * ascending and sort key values are dispatched in an action
   * because, when a track list is sorted, the play id may change,
   * which needs an update to the store.
   *
   * Ensure empty string is returned. Otherwise, input component
   * may think it's uncontrolled */
  function _getRouterSearchString(qp) {
    if (!qp) {
      return ''
    }
    return qp.get(SEARCH_QUERY_KEY) || ''
  }

  const getRouterSearchString = createSelector(
    [getRouterQueryParams],
    _getRouterSearchString
  )

  /* router ascending  */
  function _getRouterAscending(qp) {
    if (!qp) {
      return DEFAULT_ASCENDING
    }
    const order = qp.get(ORDER_QUERY_KEY)
    if (order) {
      return order === 'asc'
    }
    return DEFAULT_ASCENDING
  }

  const getRouterAscending = createSelector(
    [getRouterQueryParams],
    _getRouterAscending
  )

  /* router sort key  */
  function _getRouterSortKey(qp) {
    if (!qp) {
      return DEFAULT_SORT_KEY
    }
    return qp.get(SORT_KEY_QUERY_KEY) || DEFAULT_SORT_KEY
  }

  const getRouterSortKey = createSelector(
    [getRouterQueryParams],
    _getRouterSortKey
  )

  /* playlist selector */
  const getPlaylist = createSelector(
    [getPlaylists],
    playlists => playlists && playlists[playlistName]
  )

  /* playlist search string */
  /* playlist tracks */
  const getPlaylistTracks = createSelector(
    [getPlaylist],
    playlist => playlist && playlist.tracks
  )

  /* playlist display items */
  function _getDisplayItems(tracks, library, searchString) {
    if (!tracks || !library || !searchString) {
      return null
    }

    return tracks.map((track, i) => {
      const libTrack = library[track]
      const time = formatTime(1000 * libTrack.duration)
      return { ...libTrack, time, playId: i + '' }
    })
  }

  const getDisplayItems = createSelector(
    [getPlaylistTracks, getLibrary, getRouterSearchString],
    _getDisplayItems
  )

  function _getSearchItems(displayItems, searchString) {
    if (!displayItems) {
      return null
    }
    return trackSearch(displayItems, searchString)
  }

  const getSearchItems = createSelector(
    [getDisplayItems, getRouterSearchString],
    _getSearchItems
  )
  return {
    getPlaylist,
    getRouterAscending,
    getRouterSearchString,
    getRouterSortKey,
    getSearchItems
  }
}

/* library playlist search */
const getLibraryPlaylist = createSelector(
  [getPlaylists],
  playlists => playlists && playlists[FULL_PLAYLIST]
)

function _getLibraryPlaylistSearch(playlist) {
  if (!playlist) {
    return null
  }
  return playlist.search
}

const getLibraryPlaylistSearch = createSelector(
  [getLibraryPlaylist],
  _getLibraryPlaylistSearch
)

/* default playlist search string */
const getDefaultPlaylist = createSelector(
  [getPlaylists],
  playlists => playlists && playlists[DEFAULT_PLAYLIST]
)

function _getDefaultPlaylistSearch(playlist) {
  if (!playlist) {
    return null
  }
  return playlist.search
}

const getDefaultPlaylistSearch = createSelector(
  [getDefaultPlaylist],
  _getDefaultPlaylistSearch
)

module.exports.getOrCreatePlaylistSelectors = getOrCreatePlaylistSelectors
module.exports.getLibraryPlaylistSearch = getLibraryPlaylistSearch
module.exports.getDefaultPlaylistSearch = getDefaultPlaylistSearch

module.exports.SORT_KEY_QUERY_KEY = SORT_KEY_QUERY_KEY
module.exports.SEARCH_QUERY_KEY = SEARCH_QUERY_KEY
module.exports.ORDER_QUERY_KEY = ORDER_QUERY_KEY

module.exports.DEFAULT_ASCENDING = DEFAULT_ASCENDING
module.exports.DEFAULT_SORT_KEY = DEFAULT_SORT_KEY
