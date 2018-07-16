const types = require('waves-action-types')

function selectionAdd(name, playId, trackId) {
  return { type: types.SELECTION_ADD, name, playId, trackId }
}

function selectionClearAndAdd(name, playId, trackId) {
  return { type: types.SELECTION_CLEAR_AND_ADD, name, playId, trackId }
}

function selectionRange(name, startPlayId, endPlayId, displayItems) {
  return { type: types.SELECTION_RANGE, name, startPlayId, endPlayId, displayItems }
}

function selectionRemove(name, playId) {
  return { type: types.SELECTION_REMOVE, name, playId }
}

module.exports.selectionAdd = selectionAdd
module.exports.selectionClearAndAdd = selectionClearAndAdd
module.exports.selectionRange = selectionRange
module.exports.selectionRemove = selectionRemove
