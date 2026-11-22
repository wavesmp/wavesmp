import mongoid from "mongoid-js";
import * as sinon from "sinon";
import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import { LIBRARY_NAME } from "src/constants";
import { getOrCreatePlaylistSelectors } from "src/selectors";
import { WavesSocket } from "src/socket";
import {
  TEST_TRACK1 as baseTrack1,
  TEST_TRACK2 as baseTrack2,
  TEST_PLAYLIST_NAME1 as testPlaylistName1,
  TEST_PLAYLIST_NAME2 as testPlaylistName2,
} from "src/testUtil/testData.json";

const track1 = { ...baseTrack1, id: mongoid() };
const track2 = { ...baseTrack2, id: mongoid() };
const libName = "testLibName";
const lib = {
  [track1.id]: track1,
  [track2.id]: track2,
};
const libraries = { [libName]: lib, [LIBRARY_NAME]: lib };

import * as actions from "./index";

describe("#playlists()", () => {
  it("#playlistsUpdate()", () => {
    const update = "testUpdate";
    const action = { type: actionTypes.PLAYLISTS_UPDATE, update };
    assert.isDefined(actionTypes.PLAYLISTS_UPDATE);
    assert.deepEqual(actions.playlistsUpdate(update), action);
  });

  it("#playlistCopy()", async () => {
    const ws = new WavesSocket(() => ({}));

    const thunk = actions.playlistCopy(testPlaylistName1, testPlaylistName2);

    assert.isDefined(actionTypes.PLAYLIST_COPY);
    const action = {
      type: actionTypes.PLAYLIST_COPY,
      src: testPlaylistName1,
      dest: testPlaylistName2,
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const data = { src: testPlaylistName1, dest: testPlaylistName2 };
    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(actionTypes.PLAYLIST_COPY, data);

    await thunk(dispatchMock, undefined, { ws });

    dispatchMock.verify();
    wsMock.verify();
  });

  it("#playlistDelete()", async () => {
    const ws = new WavesSocket(() => ({}));

    const thunk = actions.playlistDelete(testPlaylistName1);

    assert.isDefined(actionTypes.PLAYLIST_DELETE);
    const action = {
      type: actionTypes.PLAYLIST_DELETE,
      playlistName: testPlaylistName1,
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(actionTypes.PLAYLIST_DELETE, {
        playlistName: testPlaylistName1,
      });

    await thunk(dispatchMock, undefined, { ws });

    dispatchMock.verify();
    wsMock.verify();
  });

  it("#playlistMove()", async () => {
    const ws = new WavesSocket(() => ({}));

    const thunk = actions.playlistMove(testPlaylistName1, testPlaylistName2);

    assert.isDefined(actionTypes.PLAYLIST_MOVE);
    const action = {
      type: actionTypes.PLAYLIST_MOVE,
      src: testPlaylistName1,
      dest: testPlaylistName2,
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(actionTypes.PLAYLIST_MOVE, {
        src: testPlaylistName1,
        dest: testPlaylistName2,
      });

    await thunk(dispatchMock, undefined, { ws });

    dispatchMock.verify();
    wsMock.verify();
  });

  it("#playlistAdd()", () => {
    const source = testPlaylistName1;
    const dest = testPlaylistName2;
    const addTracks = [track1.id, track2.id];
    const sourceSelection = new Map();
    sourceSelection.set(0, track1.id);
    sourceSelection.set(1, track2.id);
    sourceSelection.set(25, "trackId25");
    const destSelection = new Map();
    destSelection.set(8, "trackId8");
    const playlists = {
      [source]: {
        selection: sourceSelection,
        tracks: [track1.id, track2.id],
      },
      [dest]: {
        selection: destSelection,
      },
    };
    const tracks = { playlists, libraries };
    const account = { rowsPerPage: 25 };

    /* Selectors are normally created when the playlist is first viewed */
    getOrCreatePlaylistSelectors(source, URLSearchParams, LIBRARY_NAME);

    const ws = new WavesSocket(() => ({}));

    const thunk = actions.playlistAdd(source, dest);

    assert.isDefined(actionTypes.PLAYLIST_ADD);
    const action = {
      type: actionTypes.PLAYLIST_ADD,
      playlistName: dest,
      addTracks,
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendBestEffortMessage")
      .once()
      .withExactArgs(actionTypes.PLAYLIST_ADD, {
        playlistName: dest,
        trackIds: addTracks,
      });

    thunk(dispatchMock, () => ({ tracks, account }), { ws });

    dispatchMock.verify();
    wsMock.verify();
  });

  it("#playlistCreate()", async () => {
    const dispatchMock = sinon.mock();
    const ws = new WavesSocket(() => ({}));
    const wsMock = sinon.mock(ws);

    const playlistName = testPlaylistName1;
    const addTracks = [];

    const thunk = actions.playlistCreate(playlistName);

    assert.isDefined(actionTypes.PLAYLIST_ADD);
    const action = {
      type: actionTypes.PLAYLIST_ADD,
      playlistName,
      addTracks,
    };

    dispatchMock.once().withExactArgs(action);

    wsMock
      .expects("sendBestEffortMessage")
      .once()
      .withExactArgs(actionTypes.PLAYLIST_ADD, {
        playlistName,
        trackIds: addTracks,
      });

    await thunk(dispatchMock, undefined, { ws });

    dispatchMock.verify();
    wsMock.verify();
  });
});
