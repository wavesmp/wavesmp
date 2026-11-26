import { actionTypes } from "src/actionTypes";
import type { DisplayItem, WavesAction } from "src/types/actionTypes";

function selectionAdd(
  name: string,
  index: number,
  trackId: string,
): Extract<WavesAction, { type: typeof actionTypes.SELECTION_ADD }> {
  return { type: actionTypes.SELECTION_ADD, name, index, trackId };
}

function selectionClearAndAdd(
  name: string,
  index: number,
  trackId: string,
  displayItems: readonly DisplayItem[],
): Extract<WavesAction, { type: typeof actionTypes.SELECTION_CLEAR_AND_ADD }> {
  return {
    type: actionTypes.SELECTION_CLEAR_AND_ADD,
    name,
    index,
    trackId,
    displayItems,
  };
}

function selectionRange(
  name: string,
  startIndex: number,
  endIndex: number,
  displayItems: readonly DisplayItem[],
): Extract<WavesAction, { type: typeof actionTypes.SELECTION_RANGE }> {
  return {
    type: actionTypes.SELECTION_RANGE,
    name,
    startIndex,
    endIndex,
    displayItems,
  };
}

function selectionRemove(
  name: string,
  index: number,
): Extract<WavesAction, { type: typeof actionTypes.SELECTION_REMOVE }> {
  return { type: actionTypes.SELECTION_REMOVE, name, index };
}

export { selectionAdd, selectionClearAndAdd, selectionRange, selectionRemove };
