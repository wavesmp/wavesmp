const Fuse = require('fuse.js')
const { createSelector } = require('reselect')

const {
  getLibrary,
  getRowsPerPage,
  _getPlaylist,
  normalizeTrack
} = require('./base')

const FUSE_OPTS = {
  keys: ['title', 'artist', 'album', 'genre'],
  shouldSort: false,
  threshold: 0.2
}
const ORDER_QUERY_KEY = 'order'
const PAGE_QUERY_KEY = 'page'
const SEARCH_QUERY_KEY = 'search'
const SORT_KEY_QUERY_KEY = 'sortKey'

const DEFAULT_ASCENDING = true
const DEFAULT_PAGE = 0
const DEFAULT_SORT_KEY = 'title'
const DEFAULT_SEARCH_STRING = ''

function createPlaylistSelectors(playlistName, URLSearchParams, libProp) {
  function getLibrary(state) {
    return state.tracks[libProp]
  }

  /* router query params */
  function _getRouterQueryParams(search) {
    if (!search) {
      return null
    }
    return new URLSearchParams(search)
  }

  /* Use direct search value since query params may need to be
   * accessed e.g. when sorting, track next, etc */
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
      return DEFAULT_SEARCH_STRING
    }
    return qp.get(SEARCH_QUERY_KEY) || DEFAULT_SEARCH_STRING
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

  /* router page  */
  function _getRouterPage(qp) {
    if (!qp) {
      return DEFAULT_PAGE
    }
    return parseInt(qp.get(PAGE_QUERY_KEY), 10) || DEFAULT_PAGE
  }

  const getRouterPage = createSelector(
    [getRouterQueryParams],
    _getRouterPage
  )

  function getPlaylist(state) {
    return _getPlaylist(state, playlistName)
  }

  /* playlist tracks */
  function getPlaylistTracks(state) {
    const playlist = getPlaylist(state)
    if (!playlist) {
      return null
    }
    return playlist.tracks
  }

  /* playlist display items */
  function _getFuse(tracks, library, searchString) {
    if (!tracks || !searchString) {
      return null
    }
    const items = tracks.map((track, i) => normalizeTrack(library[track], i))
    return new Fuse(items, FUSE_OPTS)
  }

  const getFuse = createSelector(
    [getPlaylistTracks, getLibrary, getRouterSearchString],
    _getFuse
  )

  function _getSearchItems(fuse, searchString) {
    if (!fuse) {
      return null
    }
    return fuse.search(searchString)
  }

  const getSearchItems = createSelector(
    [getFuse, getRouterSearchString],
    _getSearchItems
  )

  function _getNumItems(searchItems, tracks) {
    if (searchItems) {
      return searchItems.length
    }
    if (tracks) {
      return tracks.length
    }
    return null
  }

  const getNumItems = createSelector(
    [getSearchItems, getPlaylistTracks],
    _getNumItems
  )

  function getPageItems(searchItems, tracks, library, startIndex, stopIndex) {
    if (searchItems) {
      return searchItems.slice(startIndex, stopIndex)
    }
    const { length } = tracks
    const displayItems = []
    for (let i = startIndex; i < stopIndex && i < length; i += 1) {
      const track = library[tracks[i]]
      displayItems.push(normalizeTrack(track, i))
    }
    return displayItems
  }

  function _getPagination(
    currentPage,
    numItems,
    rowsPerPage,
    searchItems,
    tracks,
    library
  ) {
    if (!tracks) {
      return null
    }
    const lastPage = Math.floor((numItems - 1) / rowsPerPage)

    // TODO handle this in redirect?
    if (currentPage < 0) {
      currentPage = 0
    } else if (currentPage > lastPage) {
      currentPage = lastPage
    }

    const startIndex = currentPage * rowsPerPage
    const stopIndex = (currentPage + 1) * rowsPerPage
    const displayItems = getPageItems(
      searchItems,
      tracks,
      library,
      startIndex,
      stopIndex
    )

    return {
      currentPage,
      lastPage,
      numItems,
      displayItems
    }
  }

  const getPagination = createSelector(
    [
      getRouterPage,
      getNumItems,
      getRowsPerPage,
      getSearchItems,
      getPlaylistTracks,
      getLibrary
    ],
    _getPagination
  )

  return {
    getPlaylist,
    getRouterQueryParams,
    getRouterAscending,
    getRouterSearchString,
    getRouterSortKey,
    getSearchItems,
    getNumItems,
    getPagination
  }
}

module.exports.createPlaylistSelectors = createPlaylistSelectors
