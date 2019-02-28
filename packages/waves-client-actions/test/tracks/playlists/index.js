const { assert } = require('chai')
const mongoid = require('mongoid-js')
const sinon = require('sinon')

const types = require('waves-action-types')
const { DEFAULT_PLAYLIST } = require('waves-client-constants')
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
const library = {
  [track1.id]: track1,
  [track2.id]: track2
}

const actions = require('../../../src/tracks/playlists')

describe('#playlists()', () => {
  it('#playlistsUpdate()', () => {
    const update = 'testUpdate'
    const action = { type: types.PLAYLISTS_UPDATE, update }
    assert.isDefined(types.PLAYLISTS_UPDATE)
    assert.deepEqual(actions.playlistsUpdate(update), action)
  })

  it('#playlistCopy()', () => {
    const ws = new WavesSocket({})

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
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_COPY, data)

    thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistDelete()', () => {
    const ws = new WavesSocket({})

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
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_DELETE, { playlistName: testPlaylistName1 })

    thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistMove()', () => {
    const ws = new WavesSocket({})

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
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_MOVE, {
        src: testPlaylistName1,
        dest: testPlaylistName2
      })

    thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistRemove()', () => {
    const deleteIndexes = [9, 4, 0]
    const playlists = {
      [testPlaylistName1]: {
        selection: { 4: 'trackId4', 0: 'trackId0', 9: 'trackId9' }
      },
      [testPlaylistName2]: {
        selection: { 8: 'trackId8' }
      }
    }
    const tracks = { playlists }

    const ws = new WavesSocket({})

    const thunk = actions.playlistRemove(testPlaylistName1)

    assert.isDefined(types.PLAYLIST_REMOVE)
    const action = {
      type: types.PLAYLIST_REMOVE,
      playlistName: testPlaylistName1,
      deleteIndexes
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_REMOVE, {
        playlistName: testPlaylistName1,
        deleteIndexes
      })

    thunk(dispatchMock, () => ({ tracks }), { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistAdd()', () => {
    const source = testPlaylistName1
    const dest = testPlaylistName2
    const addTracks = ['trackId0', 'trackId4', 'trackId9']
    const playlists = {
      [source]: {
        selection: { 4: 'trackId4', 0: 'trackId0', 9: 'trackId9' }
      },
      [dest]: {
        selection: { 8: 'trackId8' }
      }
    }
    const tracks = { playlists }

    const ws = new WavesSocket({})

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

    thunk(dispatchMock, () => ({ tracks }), { ws })

    dispatchMock.verify()
    wsMock.verify()
  })

  it('#playlistCreate()', async () => {
    const dispatchMock = sinon.mock()
    const ws = new WavesSocket({})
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
      .expects('sendAckedMessage')
      .once()
      .withExactArgs(types.PLAYLIST_ADD, { playlistName, trackIds: addTracks })

    await thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()
  })
})
