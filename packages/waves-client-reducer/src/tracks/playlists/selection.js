const actionTypes = require('waves-action-types')

const reducerSelection = {
  [actionTypes.SELECTION_CLEAR_AND_ADD]: (playlist, action) => {
    const { index, trackId } = action
    const selection = new Map()
    selection.set(index, trackId)
    return { ...playlist, selection }
  },

  [actionTypes.SELECTION_ADD]: (playlist, action) => {
    const { index, trackId } = action
    const selection = new Map(playlist.selection)
    selection.set(index, trackId)
    return { ...playlist, selection }
  },

  [actionTypes.SELECTION_RANGE]: (playlist, action) => {
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
  },

  [actionTypes.SELECTION_REMOVE]: (playlist, action) => {
    const { index } = action
    const selection = new Map(playlist.selection)
    selection.delete(index)
    return { ...playlist, selection }
  }
}

module.exports = reducerSelection
