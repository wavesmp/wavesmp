const actionTypes = require('waves-action-types')

function reducerSelection(playlist, action) {
  switch (action.type) {
    case actionTypes.SELECTION_CLEAR_AND_ADD: {
      const { index, trackId, displayItems } = action
      const selection = new Map(playlist.selection)
      for (const item of displayItems) {
        selection.delete(item.index)
      }
      selection.set(index, trackId)
      return { ...playlist, selection }
    }

    case actionTypes.SELECTION_ADD: {
      const { index, trackId } = action
      const selection = new Map(playlist.selection)
      selection.set(index, trackId)
      return { ...playlist, selection }
    }

    case actionTypes.SELECTION_RANGE: {
      const selection = new Map(playlist.selection)
      const { startIndex, endIndex, displayItems } = action
      let startSelection = false

      for (const item of displayItems) {
        if (
          !startSelection &&
          (item.index === startIndex || item.index === endIndex)
        ) {
          startSelection = true
          selection.set(item.index, item.id)
          continue
        }
        if (!startSelection) {
          continue
        }
        selection.set(item.index, item.id)
        if (item.index == endIndex || item.index === startIndex) {
          break
        }
      }
      return { ...playlist, selection }
    }

    case actionTypes.SELECTION_REMOVE: {
      const { index } = action
      const selection = new Map(playlist.selection)
      selection.delete(index)
      return { ...playlist, selection }
    }
  }
}

module.exports = reducerSelection
