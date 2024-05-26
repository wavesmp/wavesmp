const types = require('waves-action-types')

function selectionAdd(name, index, trackId) {
  return { type: types.SELECTION_ADD, name, index, trackId }
}

function selectionClearAndAdd(name, index, trackId, displayItems) {
  return {
    type: types.SELECTION_CLEAR_AND_ADD,
    name,
    index,
    trackId,
    displayItems,
  }
}

function selectionRange(name, startIndex, endIndex, displayItems) {
  return {
    type: types.SELECTION_RANGE,
    name,
    startIndex,
    endIndex,
    displayItems,
  }
}

function selectionRemove(name, index) {
  return { type: types.SELECTION_REMOVE, name, index }
}

module.exports.selectionAdd = selectionAdd
module.exports.selectionClearAndAdd = selectionClearAndAdd
module.exports.selectionRange = selectionRange
module.exports.selectionRemove = selectionRemove
