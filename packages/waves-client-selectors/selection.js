const { filterSelection } = require('waves-client-util')

const { getPlaylistSelectors } = require('./playlist')
const { getPlaylistSearch } = require('./base')

function getFilteredSelection(state, playlistName) {
  const search = getPlaylistSearch(state, playlistName)
  const { getPlaylistProps } = getPlaylistSelectors(playlistName)
  const { selection, displayItems } = getPlaylistProps(state, search)
  return filterSelection(displayItems, selection)
}

function removeSelection(state, playlistName) {
  const search = getPlaylistSearch(state, playlistName)
  const { getPlaylistProps } = getPlaylistSelectors(playlistName)
  const { selection, displayItems, index: oldPlaylistIndex } = getPlaylistProps(
    state,
    search
  )
  let playlistIndex = oldPlaylistIndex

  const indexes = Array.from(selection.keys())
  indexes.sort((a, b) => a - b)

  const displayIndexes = new Set(displayItems.map(item => item.index))

  const removedSelection = new Map()
  const updatedSelection = new Map()

  let numRemoved = 0
  let playlistIndexOffset = 0
  for (const index of indexes) {
    if (displayIndexes.has(index)) {
      removedSelection.set(index, selection.get(index))
      numRemoved += 1
      if (playlistIndex != null) {
        if (index === playlistIndex) {
          playlistIndex = null
        } else if (index < playlistIndex) {
          playlistIndexOffset += 1
        }
      }
    } else {
      updatedSelection.set(index - numRemoved, selection.get(index))
    }
  }

  if (playlistIndex) {
    playlistIndex -= playlistIndexOffset
  }

  return {
    oldIndex: oldPlaylistIndex,
    index: playlistIndex,
    removedSelection,
    updatedSelection
  }
}

module.exports.getFilteredSelection = getFilteredSelection
module.exports.removeSelection = removeSelection
