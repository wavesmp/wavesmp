import mongoid from "mongoid-js";
import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";
import {
  TEST_TRACK1 as baseTrack1,
  TEST_TRACK2 as baseTrack2,
  TEST_TRACK1_UPDATE as update1,
} from "src/testUtil/testData.json";

const track1 = { ...baseTrack1, id: mongoid() };
const track2 = { ...baseTrack2, id: mongoid() };
const libName = "testLibName";
const updateKey = "title";
const testLib = {
  [track1.id]: track1,
  [track2.id]: track2,
};

import { reducerLibraries as libraries } from "./libraries";

describe("#libraries()", () => {
  let state;
  let action;

  it("initial state", () => {
    state = assertNewState(libraries, undefined, UNKNOWN_ACTION);
    assert.isObject(state);
    assert.isEmpty(state);
  });

  it("tracks add", () => {
    assert.isDefined(actionTypes.TRACKS_ADD);
    action = { type: actionTypes.TRACKS_ADD, lib: testLib, libName };
    state = assertNewState(libraries, state, action);
    assert.deepEqual(state, { [libName]: testLib });
  });

  it("libraries track update", () => {
    assert.isDefined(actionTypes.TRACKS_INFO_UPDATE);
    action = {
      type: actionTypes.TRACKS_INFO_UPDATE,
      ids: [track1.id],
      key: updateKey,
      value: update1[updateKey],
      libName,
    };
    state = assertNewState(libraries, state, action);
    const expectedState = {
      [libName]: {
        ...testLib,
        [track1.id]: {
          ...track1,
          [updateKey]: update1[updateKey],
        },
      },
    };
    assert.deepEqual(state, expectedState);
  });

  it("libraries delete", () => {
    action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track2.id]),
      libName,
    };
    state = assertNewState(libraries, state, action);
    const expectedState = {
      [libName]: {
        [track1.id]: {
          ...track1,
          [updateKey]: update1[updateKey],
        },
      },
    };
    assert.deepEqual(state, expectedState);
  });
});
