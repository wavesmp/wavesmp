const { assert } = require('chai')
const mongoid = require('mongoid-js')
const sinon = require('sinon')

const types = require('waves-action-types')
const { DEFAULT_PLAYLIST, libTypes } = require('waves-client-constants')
const WavesSocket = require('waves-socket')
const {
  TEST_PLAYLIST_NAME1: testPlaylistName1,
  TEST_PLAYLIST_NAME2: testPlaylistName2,
  TEST_SEARCH: testSearch,
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2
} = require('waves-test-data')

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }
const libType = 'testLibType'
const lib = {
  [track1.id]: track1,
  [track2.id]: track2
}
const libraries = { [libType]: lib, [libTypes.WAVES]: lib }

const actions = require('../../../src/tracks/playlists')

describe('#playlists()', () => {
  it('#playlistsUpdate()', () => {
    const update = 'testUpdate'
    const action = { type: types.PLAYLISTS_UPDATE, update }
    assert.isDefined(types.PLAYLISTS_UPDATE)
    assert.deepEqual(actions.playlistsUpdate(update), action)
  })

  it('#playlistCopy()', async () => {
    const ws = new WavesSocket(() => ({}))

    const thunk = actions.playlistCopy(testPlaylistName1, testPlaylistName2)

    assert.isDefined(types.PLAYLIST_COPY)
    const action = {
      type: types.PLAYLIST_COPY,
      src: testPlaylistName1,
      dest: testPlaylistName2
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const data = { src: testPlaylistName1, dest: testPlaylistName2 }
    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendAckedMessage')
      .once()
      .withExactArgs(types.PLAYLIST_COPY, data)

    await thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistDelete()', async () => {
    const ws = new WavesSocket(() => ({}))

    const thunk = actions.playlistDelete(testPlaylistName1)

    assert.isDefined(types.PLAYLIST_DELETE)
    const action = {
      type: types.PLAYLIST_DELETE,
      playlistName: testPlaylistName1
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendAckedMessage')
      .once()
      .withExactArgs(types.PLAYLIST_DELETE, { playlistName: testPlaylistName1 })

    await thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistMove()', async () => {
    const ws = new WavesSocket(() => ({}))

    const thunk = actions.playlistMove(testPlaylistName1, testPlaylistName2)

    assert.isDefined(types.PLAYLIST_MOVE)
    const action = {
      type: types.PLAYLIST_MOVE,
      src: testPlaylistName1,
      dest: testPlaylistName2
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendAckedMessage')
      .once()
      .withExactArgs(types.PLAYLIST_MOVE, {
        src: testPlaylistName1,
        dest: testPlaylistName2
      })

    await thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistAdd()', () => {
    const source = testPlaylistName1
    const dest = testPlaylistName2
    const addTracks = [track1.id, track2.id]
    const sourceSelection = new Map()
    sourceSelection.set(0, track1.id)
    sourceSelection.set(1, track2.id)
    sourceSelection.set(25, 'trackId25')
    const destSelection = new Map()
    destSelection.set(8, 'trackId8')
    const playlists = {
      [source]: {
        selection: sourceSelection,
        tracks: [track1.id, track2.id]
      },
      [dest]: {
        selection: destSelection
      }
    }
    const tracks = { playlists, libraries }
    const account = { rowsPerPage: 25 }

    const ws = new WavesSocket(() => ({}))

    const thunk = actions.playlistAdd(source, dest)

    assert.isDefined(types.PLAYLIST_ADD)
    const action = {
      type: types.PLAYLIST_ADD,
      playlistName: dest,
      addTracks
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_ADD, {
        playlistName: dest,
        trackIds: addTracks
      })

    thunk(dispatchMock, () => ({ tracks, account }), { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistCreate()', async () => {
    const dispatchMock = sinon.mock()
    const ws = new WavesSocket(() => ({}))
    const wsMock = sinon.mock(ws)

    const playlistName = testPlaylistName1
    const addTracks = []

    const thunk = actions.playlistCreate(playlistName)

    assert.isDefined(types.PLAYLIST_ADD)
    const action = {
      type: types.PLAYLIST_ADD,
      playlistName,
      addTracks
    }

    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const wsExpect = wsMock
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_ADD, { playlistName, trackIds: addTracks })

    await thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })
})
