const { assert } = require("chai");

const actionTypes = require("waves-action-types");

const { assertNewState } = require("waves-test-util");
const { TEST_PLAYLIST_NAME1: playlistName } = require("waves-test-data");

const selection = require("../../../src/tracks/playlists/selection");

describe("#selection()", () => {
  let state = { name: playlistName, selection: new Map() };

  it("Initial clear and add", () => {
    const action = {
      type: actionTypes.SELECTION_CLEAR_AND_ADD,
      index: 0,
      trackId: "trackId0",
      displayItems: [],
    };
    state = assertNewState(selection, state, action);
    const expectedSelection = new Map();
    expectedSelection.set(0, "trackId0");
    assert.deepEqual(state.selection, expectedSelection);
  });

  it("selection add", () => {
    const action = {
      type: actionTypes.SELECTION_ADD,
      index: 1,
      trackId: "trackId1",
    };
    state = assertNewState(selection, state, action);
    const expectedSelection = new Map();
    expectedSelection.set(0, "trackId0");
    expectedSelection.set(1, "trackId1");
    assert.deepEqual(state.selection, expectedSelection);
  });

  it("selection remove", () => {
    const action = {
      type: actionTypes.SELECTION_REMOVE,
      index: 0,
    };
    state = assertNewState(selection, state, action);
    const expectedSelection = new Map();
    expectedSelection.set(1, "trackId1");
    assert.deepEqual(state.selection, expectedSelection);
  });

  it("selection range", () => {
    const items = [];
    for (let i = 10; i < 20; i += 1) {
      items.push({ index: i, id: `trackId${i}` });
    }

    const action = {
      type: actionTypes.SELECTION_RANGE,
      displayItems: items,
      startIndex: 12,
      endIndex: 15,
    };
    state = assertNewState(selection, state, action);
    const expectedSelection = new Map();
    expectedSelection.set(1, "trackId1");
    expectedSelection.set(12, "trackId12");
    expectedSelection.set(13, "trackId13");
    expectedSelection.set(14, "trackId14");
    expectedSelection.set(15, "trackId15");
    assert.deepEqual(state.selection, expectedSelection);
  });

  it("clear and add", () => {
    const items = [];
    for (let i = 10; i < 20; i += 1) {
      items.push({ index: i, id: `trackId${i}` });
    }

    const action = {
      type: actionTypes.SELECTION_CLEAR_AND_ADD,
      index: 5,
      trackId: "trackId5",
      displayItems: items,
    };
    state = assertNewState(selection, state, action);
    const expectedSelection = new Map();
    expectedSelection.set(1, "trackId1");
    expectedSelection.set(5, "trackId5");
    assert.deepEqual(state.selection, expectedSelection);
  });
});
