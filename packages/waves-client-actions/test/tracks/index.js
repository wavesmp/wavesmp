const { assert } = require("chai");
const { URLSearchParams } = require("url");
const sinon = require("sinon");

const types = require("waves-action-types");
const {
  LIBRARY_NAME,
  NOW_PLAYING_NAME,
  UPLOADS_NAME,
} = require("waves-client-constants");
const Player = require("waves-client-player");
const { normalizeTrack } = require("waves-client-util");
const WavesSocket = require("waves-socket");
const {
  TEST_PLAYLIST_NAME1: testPlaylistName1,
  TEST_PLAYLIST_NAME2: testPlaylistName2,
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2,
} = require("waves-test-data");

const actions = require("../../src/tracks");

const SEARCH_QUERY_KEY = "search";
const libName = "testLibName";
const id1 = "5c3d93000000000000000000";
const id2 = "5a5c5f800000000000000000";
const createdAt2 = 1516003200;
const createdAtPretty2 = "1/15/2018, 8:00:00 AM";
const track1 = { ...baseTrack1, id: id1 };
const track2 = { ...baseTrack2, id: id2 };
const lib = {
  [id1]: track1,
  [id2]: track2,
};
const libraries = {
  [LIBRARY_NAME]: lib,
  [UPLOADS_NAME]: lib,
};

describe("#tracks()", async () => {
  it("track toggle test playlist", async () => {
    const testIndex = "testIndex";

    const ws = new WavesSocket(() => ({}));
    const player = new Player({});

    assert.isDefined(types.TRACK_TOGGLE);
    const thunk = actions.trackToggle(track2.id, testPlaylistName2, testIndex);

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs({
      type: types.TRACK_TOGGLE,
      playlistName: testPlaylistName2,
      index: testIndex,
      track: track2,
      oldPlaylistName: testPlaylistName1,
    });

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendBestEffortMessage")
      .once()
      .withExactArgs(types.PLAYLIST_ADD, {
        playlistName: NOW_PLAYING_NAME,
        trackIds: [track2.id],
      });

    const playerMock = sinon.mock(player);
    playerMock.expects("trackToggle").once().withExactArgs(track2);

    const playing = { playlist: testPlaylistName1 };
    const tracks = { playing, libraries };
    thunk(dispatchMock, () => ({ tracks }), { player, ws });

    dispatchMock.verify();
    playerMock.verify();
    wsMock.verify();
  });

  it("track toggle default playlist", async () => {
    const testIndex = "testIndex";

    const player = new Player({});

    const thunk = actions.trackToggle(track2.id, NOW_PLAYING_NAME, testIndex);

    assert.isDefined(types.TRACK_TOGGLE);
    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs({
      type: types.TRACK_TOGGLE,
      playlistName: NOW_PLAYING_NAME,
      index: testIndex,
      track: track2,
      oldPlaylistName: testPlaylistName1,
    });

    const playerMock = sinon.mock(player);
    playerMock.expects("trackToggle").once().withExactArgs(track2);

    const playing = { playlist: testPlaylistName1 };
    const tracks = { playing, libraries };
    thunk(dispatchMock, () => ({ tracks }), { player });

    dispatchMock.verify();
    playerMock.verify();
  });

  it("track next on playlist without search", async () => {
    const ws = new WavesSocket(() => ({}));
    const player = new Player({});
    const playlistName = testPlaylistName1;

    const thunk = actions.trackNext(URLSearchParams);

    assert.isDefined(types.TRACK_NEXT);
    const expectedTrack = normalizeTrack(track2, 1);
    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs({
      type: types.TRACK_NEXT,
      nextTrack: expectedTrack,
      playlistName,
    });

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendBestEffortMessage")
      .once()
      .withExactArgs(types.PLAYLIST_ADD, {
        playlistName: NOW_PLAYING_NAME,
        trackIds: [track2.id],
      });

    const isPlaying = true;
    const playerMock = sinon.mock(player);
    playerMock
      .expects("trackNext")
      .once()
      .withExactArgs(expectedTrack, isPlaying);

    const playing = { playlist: playlistName, isPlaying, shuffle: false };
    const playlist = {
      tracks: [track1.id, track2.id],
      index: 0,
      search: "",
    };
    const playlists = { [playlistName]: playlist };
    const tracks = { playing, playlists, libraries };
    thunk(dispatchMock, () => ({ tracks }), { player, ws });

    dispatchMock.verify();
    playerMock.verify();
    wsMock.verify();
  });

  it("track prev on default playlist with search", async () => {
    const searchString = "thisisaveryspecificsearchstring";
    const search = `${SEARCH_QUERY_KEY}=${searchString}`;

    const track1Copy = { ...track1, title: searchString };
    const expectedTrack1 = normalizeTrack(track1Copy, 0);
    const track2Copy = { ...track2, title: searchString };
    const playlistName = NOW_PLAYING_NAME;

    const libraryCopy = {
      [track1Copy.id]: track1Copy,
      [track2Copy.id]: track2Copy,
    };
    const librariesCopy = {
      [LIBRARY_NAME]: libraryCopy,
    };

    const player = new Player({});

    const thunk = actions.trackPrevious(URLSearchParams);

    assert.isDefined(types.TRACK_NEXT);
    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs({
      type: types.TRACK_NEXT,
      nextTrack: expectedTrack1,
      playlistName,
    });

    const isPlaying = true;
    const playerMock = sinon.mock(player);
    playerMock
      .expects("trackNext")
      .once()
      .withExactArgs(expectedTrack1, isPlaying);

    const playing = { playlist: playlistName, isPlaying, shuffle: false };
    const playlist = {
      tracks: [track1Copy.id, track2Copy.id],
      index: 1,
      search,
    };
    const playlists = { [playlistName]: playlist };
    const tracks = { playing, playlists, libraries: librariesCopy };
    thunk(dispatchMock, () => ({ tracks }), { player });

    dispatchMock.verify();
    playerMock.verify();
  });

  it("initial library add", async () => {
    const getState = () => ({ tracks: { libraries: { [libName]: null } } });
    const update = [track1];
    const updatedLib = { [track1.id]: track1 };
    const thunk = actions.tracksAdd(update, libName);

    const action = { type: types.TRACKS_ADD, lib: updatedLib, libName };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    thunk(dispatchMock, getState);

    dispatchMock.verify();
  });

  it("library update", async () => {
    const track2Copy = { ...track2, title: "" };
    const lib = { [track1.id]: track1 };
    const getState = () => ({ tracks: { libraries: { [libName]: lib } } });
    const update = [track2Copy];
    const updatedLibrary = {
      [track1.id]: track1,
      [track2Copy.id]: {
        ...track2Copy,
        title: "Unknown title",
        createdAt: createdAt2,
        createdAtPretty: createdAtPretty2,
      },
    };
    const thunk = actions.tracksAdd(update, libName);

    const action = { type: types.TRACKS_ADD, lib: updatedLibrary, libName };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    thunk(dispatchMock, getState);

    dispatchMock.verify();
  });

  it("#tracksUpload()", async () => {
    const player = new Player({});
    const ws = new WavesSocket(() => ({}));

    const sourceType = "s3";
    const fileName1 = "testFileName1";
    const fileName2 = "testFileName2";
    const playing = { track: { ...track1, file: { name: fileName1 } } };
    const uploads = {
      [track1.id]: { ...track1, file: { name: fileName1 } },
      [track2.id]: { ...track2, file: { name: fileName2 } },
    };
    const uploadPlaylist = {
      tracks: [track1.id, track2.id],
      index: 1,
      selection: new Map(),
    };
    const playlists = { [UPLOADS_NAME]: uploadPlaylist };
    const uploadValues = Object.values(uploads);
    const testLibraries = {
      [LIBRARY_NAME]: null,
      [UPLOADS_NAME]: uploads,
    };
    const getState = () => ({
      tracks: { playing, playlists, libraries: testLibraries },
    });

    const thunk = actions.tracksUpload(sourceType);

    const playerMock = sinon.mock(player);
    playerMock
      .expects("upload")
      .once()
      .withExactArgs(sourceType, uploadValues)
      .returns(uploadValues.map((uploadValue) => Promise.resolve(uploadValue)));

    assert.isDefined(types.TRACKS_ADD);
    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(types.TRACKS_ADD, { tracks: uploadValues });

    playerMock.expects("pause").once().withExactArgs();

    const dispatchMock = sinon.mock();
    const dispatchExpect = dispatchMock.exactly(6);

    await thunk(dispatchMock, getState, { player, ws });

    assert.isDefined(types.TRACKS_INFO_UPDATE);
    const uploadIds = Object.keys(uploads);
    const firstDispatchCall = dispatchExpect.firstCall;
    assert.isTrue(
      firstDispatchCall.calledWithExactly({
        type: types.TRACKS_INFO_UPDATE,
        ids: uploadIds,
        key: "state",
        value: "uploading",
        libName: UPLOADS_NAME,
      }),
    );

    const secondDispatchCall = dispatchExpect.secondCall;
    assert.isTrue(
      secondDispatchCall.calledWithExactly({
        type: types.TRACKS_INFO_UPDATE,
        ids: uploadIds,
        key: "uploadProgress",
        value: 0,
        libName: UPLOADS_NAME,
      }),
    );

    assert.isDefined(types.TOAST_ADD);
    const thirdDispatchCall = dispatchExpect.thirdCall;
    const thirdCallArgs = thirdDispatchCall.args;
    assert.lengthOf(thirdCallArgs, 1);
    const thirdCallArg = thirdCallArgs[0];
    /* Toast add function */
    assert.isFunction(thirdCallArg);

    assert.isDefined(types.TOAST_ADD);
    const fourthDispatchCall = dispatchExpect.getCall(3);
    const fourthCallArgs = fourthDispatchCall.args;
    assert.lengthOf(fourthCallArgs, 1);
    const fourthCallArg = fourthCallArgs[0];
    /* Toast add function */
    assert.isFunction(fourthCallArg);

    assert.isDefined(types.TRACKS_DELETE);
    const uploadedIds = new Set(uploadIds);
    const fifthDispatchCall = dispatchExpect.getCall(4);
    assert.isTrue(
      fifthDispatchCall.calledWithExactly({
        type: types.TRACKS_DELETE,
        deleteIds: uploadedIds,
        libName: UPLOADS_NAME,
      }),
    );

    const sixthDispatchCall = dispatchExpect.getCall(5);
    const sixthCallArgs = sixthDispatchCall.args;
    assert.lengthOf(sixthCallArgs, 1);
    const sixthCallArg = sixthCallArgs[0];
    assert.isFunction(sixthCallArg);

    dispatchMock.verify();
    playerMock.verify();
    wsMock.verify();
  });

  it("#tracksRemove()", () => {
    const deleteIndexes = [1, 0];
    const selection1 = new Map();
    selection1.set(1, track2.id);
    selection1.set(0, track1.id);
    const selection2 = new Map();
    selection2.set(2, track2.id);
    const playlists = {
      [testPlaylistName1]: {
        selection: selection1,
        tracks: [track1.id, track2.id],
        index: 1,
      },
      [testPlaylistName2]: {
        selection: selection2,
        tracks: [track1.id, track2.id],
      },
    };
    const tracks = { libraries, playing: {}, playlists };
    const account = { rowsPerPage: 25 };

    const ws = new WavesSocket(() => ({}));

    const thunk = actions.tracksRemove(testPlaylistName1);

    assert.isDefined(types.TRACKS_REMOVE);
    const action = {
      type: types.TRACKS_REMOVE,
      playlistName: testPlaylistName1,
      deleteIndexes,
      deletePlaying: false,
      selection: new Map(),
      index: null,
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(types.TRACKS_REMOVE, {
        playlistName: testPlaylistName1,
        selection: [
          [0, track1.id],
          [1, track2.id],
        ],
      });

    thunk(dispatchMock, () => ({ tracks, account }), { ws });

    dispatchMock.verify();
    wsMock.verify();
  });

  it("#tracksInfoUpdate()", async () => {
    const ws = new WavesSocket(() => ({}));

    const { id } = track1;
    const key = "title";
    const value = "newTitle";
    const action = {
      type: types.TRACKS_INFO_UPDATE,
      ids: [id],
      key,
      value,
      libName,
    };
    const thunk = actions.tracksInfoUpdate(id, key, value, libName);

    assert.isDefined(types.TRACKS_INFO_UPDATE);
    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(types.TRACKS_INFO_UPDATE, { id, key, value });

    await thunk(dispatchMock, undefined, { ws });

    dispatchMock.verify();
    wsMock.verify();
  });

  it("#tracksLocalInfoUpdate()", () => {
    const id = "testId";
    const key = "testAttr";
    const value = "testUpdate";
    assert.isDefined(types.TRACKS_INFO_UPDATE);
    const expectedAction = {
      type: types.TRACKS_INFO_UPDATE,
      ids: [id],
      key,
      value,
      libName,
    };
    assert.deepEqual(
      actions.tracksLocalInfoUpdate(id, key, value, libName),
      expectedAction,
    );
  });
});
