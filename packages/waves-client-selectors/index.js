const { NOW_PLAYING_NAME, LIBRARY_NAME } = require('waves-client-constants')

const { getPlaylistSearch } = require('./base')
const {
  getOrCreatePlaylistSelectors,
  getPlaylistSelectors
} = require('./playlist')
const { getFilteredSelection, removeSelection } = require('./selection')

function getLibraryPlaylistSearch(state) {
  return getPlaylistSearch(state, LIBRARY_NAME)
}

function getDefaultPlaylistSearch(state) {
  return getPlaylistSearch(state, NOW_PLAYING_NAME)
}

module.exports.getOrCreatePlaylistSelectors = getOrCreatePlaylistSelectors
module.exports.getPlaylistSelectors = getPlaylistSelectors
module.exports.getPlaylistSearch = getPlaylistSearch
module.exports.getLibraryPlaylistSearch = getLibraryPlaylistSearch
module.exports.getDefaultPlaylistSearch = getDefaultPlaylistSearch
module.exports.getFilteredSelection = getFilteredSelection
module.exports.removeSelection = removeSelection
