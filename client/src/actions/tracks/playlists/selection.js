import { actionTypes } from "src/actionTypes";

function selectionAdd(name, index, trackId) {
  return { type: actionTypes.SELECTION_ADD, name, index, trackId };
}

function selectionClearAndAdd(name, index, trackId, displayItems) {
  return {
    type: actionTypes.SELECTION_CLEAR_AND_ADD,
    name,
    index,
    trackId,
    displayItems,
  };
}

function selectionRange(name, startIndex, endIndex, displayItems) {
  return {
    type: actionTypes.SELECTION_RANGE,
    name,
    startIndex,
    endIndex,
    displayItems,
  };
}

function selectionRemove(name, index) {
  return { type: actionTypes.SELECTION_REMOVE, name, index };
}

export { selectionAdd, selectionClearAndAdd, selectionRange, selectionRemove };
