import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import * as actions from "./selection";

describe("#selection()", () => {
  it("#selectionAdd()", () => {
    assert.isDefined(actionTypes.SELECTION_ADD);
    const name = "testName";
    const index = "testIndex";
    const trackId = "testTrackId";
    const expectedAction = {
      type: actionTypes.SELECTION_ADD,
      name,
      index,
      trackId,
    };
    assert.deepEqual(
      actions.selectionAdd(name, index, trackId),
      expectedAction,
    );
  });

  it("#selectionClearAndAdd()", () => {
    assert.isDefined(actionTypes.SELECTION_CLEAR_AND_ADD);
    const name = "testName";
    const index = "testIndex";
    const trackId = "testTrackId";
    const displayItems = [trackId];
    const expectedAction = {
      type: actionTypes.SELECTION_CLEAR_AND_ADD,
      name,
      index,
      trackId,
      displayItems,
    };
    assert.deepEqual(
      actions.selectionClearAndAdd(name, index, trackId, displayItems),
      expectedAction,
    );
  });

  it("#selectionRange()", () => {
    assert.isDefined(actionTypes.SELECTION_RANGE);
    const name = "testName";
    const startIndex = "testStartIndex";
    const endIndex = "testEndIndex";
    const displayItems = "testDisplayItems";
    const expectedAction = {
      type: actionTypes.SELECTION_RANGE,
      name,
      startIndex,
      endIndex,
      displayItems,
    };
    const actualAction = actions.selectionRange(
      name,
      startIndex,
      endIndex,
      displayItems,
    );
    assert.deepEqual(actualAction, expectedAction);
  });

  it("#selectionRemove()", () => {
    assert.isDefined(actionTypes.SELECTION_REMOVE);
    const name = "testName";
    const index = "testIndex";
    const expectedAction = { type: actionTypes.SELECTION_REMOVE, name, index };
    assert.deepEqual(actions.selectionRemove(name, index), expectedAction);
  });
});
