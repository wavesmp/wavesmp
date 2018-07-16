const actionTypes = require('waves-action-types')

const reducerSelection = {

  [actionTypes.SELECTION_CLEAR_AND_ADD]: (playlist, action) => {
    const { playId, trackId } = action
    const selection = {[playId]: trackId}
    return {...playlist, selection }
  },

  [actionTypes.SELECTION_ADD]: (playlist, action) => {
    const { selection } = playlist
    selection[action.playId] = action.trackId
    return {...playlist, selection: {...selection}}
  },

  [actionTypes.SELECTION_RANGE]: (playlist, action) => {
    const { selection } = playlist
    const { startPlayId, endPlayId, displayItems } = action
    const numItems = displayItems.length
    let startSelection = false

    for (let i = 0; i < numItems; i += 1) {
      const item = displayItems[i]
      if (!startSelection && (item.playId === startPlayId ||
                              item.playId === endPlayId)) {
        startSelection = true
        selection[item.playId] = item.id
        continue
      }
      if (!startSelection) {
        continue
      }
      selection[item.playId] = item.id
      if (item.playId == endPlayId || item.playId === startPlayId) {
        break
      }
    }
    return {...playlist, selection: {...selection}}
  },

  [actionTypes.SELECTION_REMOVE]: (playlist, action) => {
    const { selection } = playlist
    delete selection[action.playId]
    return {...playlist, selection: {...selection}}
  }
}

module.exports = reducerSelection
