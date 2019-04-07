const { createSelector } = require('reselect')

const { DEFAULT_PLAYLIST, FULL_PLAYLIST } = require('waves-client-constants')

const { getPlaylistSearch } = require('./base')
const { getOrCreatePlaylistSelectors } = require('./playlist')
const { getFilteredSelection, removeSelection } = require('./selection')

function getLibraryPlaylistSearch(state) {
  return getPlaylistSearch(state, FULL_PLAYLIST)
}

function getDefaultPlaylistSearch(state) {
  return getPlaylistSearch(state, DEFAULT_PLAYLIST)
}

module.exports.getOrCreatePlaylistSelectors = getOrCreatePlaylistSelectors
module.exports.getPlaylistSearch = getPlaylistSearch
module.exports.getLibraryPlaylistSearch = getLibraryPlaylistSearch
module.exports.getDefaultPlaylistSearch = getDefaultPlaylistSearch
module.exports.getFilteredSelection = getFilteredSelection
module.exports.removeSelection = removeSelection
