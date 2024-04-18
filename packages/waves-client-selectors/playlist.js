const Fuse = require('fuse.js')
const { createSelector } = require('reselect')

const { normalizeTrack } = require('waves-client-util')

const { getRowsPerPage, _getPlaylist } = require('./base')

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

const playlistSelectors = {}
function getOrCreatePlaylistSelectors(playlistName, URLSearchParams, libName) {
  let playlistSelector = playlistSelectors[playlistName]
  if (!playlistSelector) {
    playlistSelector = createPlaylistSelectors(
      playlistName,
      URLSearchParams,
      libName
    )
    playlistSelectors[playlistName] = playlistSelector
  }
  return playlistSelector
}

function getPlaylistSelectors(playlistName) {
  return playlistSelectors[playlistName]
}

function normalizePage(currentPage, lastPage) {
  if (currentPage < 0) {
    return 0
  }
  if (currentPage > lastPage) {
    return lastPage
  }
  return currentPage
}

function createPlaylistSelectors(playlistName, URLSearchParams, libName) {
  function getLib(state) {
    return state.tracks.libraries[libName]
  }

  /* router query params */
  function _getRouterQueryParams(search) {
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
    return qp.get(SEARCH_QUERY_KEY) || DEFAULT_SEARCH_STRING
  }

  const getRouterSearchString = createSelector(
    [getRouterQueryParams],
    _getRouterSearchString
  )

  /* router ascending  */
  function _getRouterAscending(qp) {
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
    return qp.get(SORT_KEY_QUERY_KEY) || DEFAULT_SORT_KEY
  }

  const getRouterSortKey = createSelector(
    [getRouterQueryParams],
    _getRouterSortKey
  )

  /* router page  */
  function _getRouterPage(qp) {
    return parseInt(qp.get(PAGE_QUERY_KEY), 10) || DEFAULT_PAGE
  }

  const getRouterPage = createSelector([getRouterQueryParams], _getRouterPage)

  function getPlaylist(state) {
    return _getPlaylist(state, playlistName)
  }

  /* playlist display items */
  function _getFuse(playlist, lib, searchString) {
    if (!playlist || !searchString) {
      return null
    }
    const { tracks } = playlist
    const items = tracks.map((track, i) => normalizeTrack(lib[track], i))
    return new Fuse(items, FUSE_OPTS)
  }

  const getFuse = createSelector(
    [getPlaylist, getLib, getRouterSearchString],
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

  function getPageItems(searchItems, tracks, lib, startIndex, stopIndex) {
    if (searchItems) {
      return searchItems.slice(startIndex, stopIndex)
    }
    const { length } = tracks
    const displayItems = []
    for (let i = startIndex; i < stopIndex && i < length; i += 1) {
      const track = lib[tracks[i]]
      displayItems.push(normalizeTrack(track, i))
    }
    return displayItems
  }

  function _getPlaylistProps(
    currentPage,
    rowsPerPage,
    searchItems,
    playlist,
    lib
  ) {
    if (!playlist) {
      return { loaded: false }
    }
    const { tracks, index, selection, sortKey, ascending } = playlist
    const numItems = searchItems ? searchItems.length : tracks.length
    const lastPage =
      numItems === 0 ? 0 : Math.floor((numItems - 1) / rowsPerPage)
    currentPage = normalizePage(currentPage, lastPage)

    const startIndex = currentPage * rowsPerPage
    const stopIndex = (currentPage + 1) * rowsPerPage
    const displayItems = getPageItems(
      searchItems,
      tracks,
      lib,
      startIndex,
      stopIndex
    )

    return {
      loaded: true,
      index,
      selection,
      sortKey,
      ascending,
      numItems,
      currentPage,
      lastPage,
      displayItems
    }
  }

  const getPlaylistProps = createSelector(
    [getRouterPage, getRowsPerPage, getSearchItems, getPlaylist, getLib],
    _getPlaylistProps
  )

  return {
    getRouterQueryParams,
    getRouterAscending,
    getRouterSearchString,
    getRouterSortKey,
    getSearchItems,
    getPlaylistProps
  }
}

module.exports.getOrCreatePlaylistSelectors = getOrCreatePlaylistSelectors
module.exports.getPlaylistSelectors = getPlaylistSelectors
