import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import {
  UNKNOWN_ACTION,
  asAction,
  assertNewState,
  newTrackId,
} from "src/testUtil";
import {
  TEST_TRACK1 as baseTrack1,
  TEST_TRACK2 as baseTrack2,
  TEST_PLAYLIST_NAME1 as playlistName1,
} from "src/testUtil/testData";
import type { Playing } from "src/types/stateTypes";

import { reducerPlaying as playing } from "./playing";

const track1 = { ...baseTrack1, id: newTrackId() };
const track2 = { ...baseTrack2, id: newTrackId() };

describe("#playing()", () => {
  let state: Playing;

  it("initial state", () => {
    state = assertNewState(playing, undefined, UNKNOWN_ACTION);
    assert.deepEqual(state, {
      isPlaying: false,
      playlist: null,
      track: null,
      shuffle: false,
      repeat: false,
    });
  });

  it("toggle repeat on", () => {
    const action = { type: actionTypes.PLAYING_REPEAT_TOGGLE };
    state = assertNewState(playing, state, action);
    assert.isTrue(state.repeat);
  });

  it("toggle repeat off", () => {
    const action = { type: actionTypes.PLAYING_REPEAT_TOGGLE };
    state = assertNewState(playing, state, action);
    assert.isFalse(state.repeat);
  });

  it("toggle shuffle on", () => {
    const action = { type: actionTypes.PLAYING_SHUFFLE_TOGGLE };
    state = assertNewState(playing, state, action);
    assert.isTrue(state.shuffle);
  });

  it("toggle repeat on while shuffle is on", () => {
    const action = { type: actionTypes.PLAYING_REPEAT_TOGGLE };
    state = assertNewState(playing, state, action);
    assert.isTrue(state.repeat);
    assert.isFalse(state.shuffle);
  });

  it("toggle repeat off", () => {
    const action = { type: actionTypes.PLAYING_REPEAT_TOGGLE };
    state = assertNewState(playing, state, action);
    assert.isFalse(state.repeat);
    assert.isFalse(state.shuffle);
  });

  it("track toggle", () => {
    const action = {
      type: actionTypes.TRACK_TOGGLE,
      playlistName: playlistName1,
      track: track1,
    };
    state = assertNewState(playing, state, action);
    assert.isTrue(state.isPlaying);
    assert.strictEqual(state.track, track1);
    assert.strictEqual(state.playlist, playlistName1);
  });

  it("track pause", () => {
    const action = { type: actionTypes.PLAYING_PAUSE };
    state = assertNewState(playing, state, action);
    assert.isFalse(state.isPlaying);
  });

  it("track play", () => {
    const action = { type: actionTypes.PLAYING_PLAY };
    state = assertNewState(playing, state, action);
    assert.isTrue(state.isPlaying);
  });

  it("track next", () => {
    const action = {
      type: actionTypes.TRACK_NEXT,
      nextTrack: track2,
    };
    state = assertNewState(playing, state, action);
    assert.isTrue(state.isPlaying);
    assert.strictEqual(state.track, track2);
    assert.strictEqual(state.playlist, playlistName1);
  });

  it("Update track info", () => {
    const key = "title";
    const updatedValue = "updatedTitle";
    assert.notEqual(updatedValue, track2[key]);
    const action = {
      type: actionTypes.TRACKS_INFO_UPDATE,
      ids: [track2.id],
      key,
      value: updatedValue,
    };
    state = assertNewState(playing, state, action);
    assert.isTrue(state.isPlaying);
    assert.deepEqual(state.track, { ...track2, [key]: updatedValue });
  });

  it("empty track next", () => {
    const action = {
      type: actionTypes.TRACK_NEXT,
      nextTrack: null,
    };
    state = assertNewState(playing, state, action);
    assert.isFalse(state.isPlaying);
  });

  it("deleting non-playing track does not affect playing", () => {
    assert.isDefined(actionTypes.TRACKS_DELETE);
    const action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track1.id]),
    };
    const oldState = state;
    state = playing(state, asAction(action));
    assert.strictEqual(state, oldState);
  });

  it("deleting playing track reverts to initial state", () => {
    assert.isDefined(actionTypes.TRACKS_DELETE);
    const action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track2.id]),
    };
    state = assertNewState(playing, state, action);
    assert.deepEqual(state, {
      isPlaying: false,
      playlist: null,
      track: null,
      shuffle: false,
      repeat: false,
    });
  });
});
