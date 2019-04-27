const { assert } = require('chai')
const mongoid = require('mongoid-js')
const { URLSearchParams } = require('url')
const sinon = require('sinon')

const types = require('waves-action-types')
const {
  DEFAULT_PLAYLIST,
  UPLOAD_PLAYLIST,
  toastTypes
} = require('waves-client-constants')
const Player = require('waves-client-player')
const { normalizeTrack } = require('waves-client-util')
const WavesSocket = require('waves-socket')
const {
  TEST_PLAYLIST_NAME1: testPlaylistName1,
  TEST_PLAYLIST_NAME2: testPlaylistName2,
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2
} = require('waves-test-data')

const SEARCH_QUERY_KEY = 'search'
const id1 = '5c3d93000000000000000000'
const createdAt1 = 1547539200
const createAtPretty1 = '1/15/2019, 8:00:00 AM'
const id2 = '5a5c5f800000000000000000'
const createdAt2 = 1516003200
const createdAtPretty2 = '1/15/2018, 8:00:00 AM'
const track1 = { ...baseTrack1, id: id1 }
const track2 = { ...baseTrack2, id: id2 }
const library = {
  [id1]: track1,
  [id2]: track2
}

const actions = require('../../src/tracks')

describe('#tracks()', async () => {
  it('track toggle test playlist', async () => {
    const testIndex = 'testIndex'

    const ws = new WavesSocket({})
    const player = new Player({})

    assert.isDefined(types.TRACK_TOGGLE)
    const thunk = actions.trackToggle(track2.id, testPlaylistName2, testIndex)

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs({
      type: types.TRACK_TOGGLE,
      playlistName: testPlaylistName2,
      index: testIndex,
      track: track2,
      oldPlaylistName: testPlaylistName1
    })

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_ADD, {
        playlistName: DEFAULT_PLAYLIST,
        trackIds: [track2.id]
      })

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock
      .expects('trackToggle')
      .once()
      .withExactArgs(track2)

    const playing = { playlist: testPlaylistName1 }
    const tracks = { playing, library }
    thunk(dispatchMock, () => ({ tracks }), { player, ws })

    dispatchMock.verify()
    playerMock.verify()
    wsMock.verify()
  })

  it('track toggle default playlist', async () => {
    const testIndex = 'testIndex'

    const player = new Player({})

    const thunk = actions.trackToggle(track2.id, DEFAULT_PLAYLIST, testIndex)

    assert.isDefined(types.TRACK_TOGGLE)
    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs({
      type: types.TRACK_TOGGLE,
      playlistName: DEFAULT_PLAYLIST,
      index: testIndex,
      track: track2,
      oldPlaylistName: testPlaylistName1
    })

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock
      .expects('trackToggle')
      .once()
      .withExactArgs(track2)

    const playing = { playlist: testPlaylistName1 }
    const tracks = { playing, library }
    thunk(dispatchMock, () => ({ tracks }), { player })

    dispatchMock.verify()
    playerMock.verify()
  })

  it('track next on playlist without search', async () => {
    const ws = new WavesSocket({})
    const player = new Player({})
    const playlistName = testPlaylistName1

    const thunk = actions.trackNext(URLSearchParams)

    assert.isDefined(types.TRACK_NEXT)
    const expectedTrack = normalizeTrack(track2, 1)
    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs({
      type: types.TRACK_NEXT,
      nextTrack: expectedTrack,
      playlistName: playlistName
    })

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_ADD, {
        playlistName: DEFAULT_PLAYLIST,
        trackIds: [track2.id]
      })

    const isPlaying = true
    const playerMock = sinon.mock(player)
    const playerExpect = playerMock
      .expects('trackNext')
      .once()
      .withExactArgs(expectedTrack, isPlaying)

    const playing = { playlist: playlistName, isPlaying, shuffle: false }
    const playlist = {
      tracks: [track1.id, track2.id],
      index: 0,
      search: ''
    }
    const playlists = { [playlistName]: playlist }
    const tracks = { playing, playlists, library }
    thunk(dispatchMock, () => ({ tracks }), { player, ws })

    dispatchMock.verify()
    playerMock.verify()
    wsMock.verify()
  })

  it('track prev on default playlist with search', async () => {
    const searchString = 'thisisaveryspecificsearchstring'
    const search = `${SEARCH_QUERY_KEY}=${searchString}`

    const track1Copy = { ...track1, title: searchString }
    const expectedTrack1 = normalizeTrack(track1Copy, 0)
    const track2Copy = { ...track2, title: searchString }
    const playlistName = DEFAULT_PLAYLIST

    const libraryCopy = {
      [track1Copy.id]: track1Copy,
      [track2Copy.id]: track2Copy
    }

    const player = new Player({})

    const thunk = actions.trackPrevious(URLSearchParams)

    assert.isDefined(types.TRACK_NEXT)
    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs({
      type: types.TRACK_NEXT,
      nextTrack: expectedTrack1,
      playlistName: playlistName
    })

    const isPlaying = true
    const playerMock = sinon.mock(player)
    const playerExpect = playerMock
      .expects('trackNext')
      .once()
      .withExactArgs(expectedTrack1, isPlaying)

    const playing = { playlist: playlistName, isPlaying, shuffle: false }
    const playlist = {
      tracks: [track1Copy.id, track2Copy.id],
      index: 1,
      search
    }
    const playlists = { [playlistName]: playlist }
    const tracks = { playing, playlists, library: libraryCopy }
    thunk(dispatchMock, () => ({ tracks }), { player })

    dispatchMock.verify()
    playerMock.verify()
  })

  it('trackUploadsUpdate()', async () => {
    const update = [track1, track2]
    assert.isDefined(types.TRACK_UPLOADS_UPDATE)
    const expectedAction = { type: types.TRACK_UPLOADS_UPDATE, update }
    assert.deepEqual(actions.trackUploadsUpdate(update), expectedAction)
  })

  it('initial library update', async () => {
    const library = null
    const getState = () => ({ tracks: { library } })
    const update = [track1]
    const updatedLibrary = { [track1.id]: track1 }
    const thunk = actions.tracksUpdate(update)

    const action = { type: types.TRACKS_UPDATE, libraryById: updatedLibrary }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    thunk(dispatchMock, getState)

    dispatchMock.verify()
  })

  it('library update', async () => {
    const track2Copy = { ...track2 }
    track2Copy.title = ''

    const library = { [track1.id]: track1 }
    const getState = () => ({ tracks: { library } })
    const update = [track2Copy]
    const updatedLibrary = {
      [track1.id]: track1,
      [track2Copy.id]: {
        ...track2Copy,
        title: 'Unknown title',
        createdAt: createdAt2,
        createdAtPretty: createdAtPretty2
      }
    }
    const thunk = actions.tracksUpdate(update)

    const action = { type: types.TRACKS_UPDATE, libraryById: updatedLibrary }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    thunk(dispatchMock, getState)

    dispatchMock.verify()
  })

  it('#tracksUpload()', async () => {
    const player = new Player({})
    const ws = new WavesSocket({})

    const sourceType = 's3'
    const fileName1 = 'testFileName1'
    const fileName2 = 'testFileName2'
    const playing = { track: { ...track1, file: { name: fileName1 } } }
    const library = null
    const uploads = {
      [track1.id]: { ...track1, file: { name: fileName1 } },
      [track2.id]: { ...track2, file: { name: fileName2 } }
    }
    const uploadPlaylist = {
      tracks: [track1.id, track2.id],
      index: 1,
      selection: new Map()
    }
    const playlists = { [UPLOAD_PLAYLIST]: uploadPlaylist }
    const uploadValues = Object.values(uploads)
    const getState = () => ({
      tracks: { uploads, playing, library, playlists }
    })

    const thunk = actions.tracksUpload(sourceType)

    const playerMock = sinon.mock(player)
    const playerUploadExpect = playerMock
      .expects('upload')
      .once()
      .withExactArgs(sourceType, uploadValues)
      .returns(uploadValues.map(uploadValue => Promise.resolve(uploadValue)))

    assert.isDefined(types.TRACKS_UPDATE)
    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendAckedMessage')
      .once()
      .withExactArgs(types.TRACKS_UPDATE, { tracks: uploadValues })

    const playerPauseExpect = playerMock
      .expects('pause')
      .once()
      .withExactArgs()

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.exactly(6)

    await thunk(dispatchMock, getState, { player, ws })

    assert.isDefined(types.UPLOAD_TRACKS_UPDATE)
    const uploadIds = Object.keys(uploads)
    const firstDispatchCall = dispatchExpect.firstCall
    assert.isTrue(
      firstDispatchCall.calledWithExactly({
        type: types.UPLOAD_TRACKS_UPDATE,
        ids: uploadIds,
        key: 'state',
        value: 'uploading'
      })
    )

    const secondDisptachCall = dispatchExpect.secondCall
    assert.isTrue(
      secondDisptachCall.calledWithExactly({
        type: types.UPLOAD_TRACKS_UPDATE,
        ids: uploadIds,
        key: 'uploadProgress',
        value: 0
      })
    )

    assert.isDefined(types.TOAST_ADD)
    const thirdDisptachCall = dispatchExpect.thirdCall
    const thirdCallArgs = thirdDisptachCall.args
    assert.lengthOf(thirdCallArgs, 1)
    const thirdCallArg = thirdCallArgs[0]
    assert.lengthOf(Object.keys(thirdCallArg), 2)
    assert.strictEqual(thirdCallArg.type, types.TOAST_ADD)
    const thirdCallToast = thirdCallArg.toast
    assert.lengthOf(Object.keys(thirdCallToast), 3)
    assert.strictEqual(thirdCallToast.type, toastTypes.Success)
    assert.strictEqual(thirdCallToast.msg, `Uploaded ${fileName1}`)
    assert.isNumber(thirdCallToast.id)

    assert.isDefined(types.TOAST_ADD)
    const fourthDisptachCall = dispatchExpect.getCall(3)
    const fourthCallArgs = fourthDisptachCall.args
    assert.lengthOf(fourthCallArgs, 1)
    const fourthCallArg = fourthCallArgs[0]
    assert.lengthOf(Object.keys(fourthCallArg), 2)
    assert.strictEqual(fourthCallArg.type, types.TOAST_ADD)
    const fourthCallToast = fourthCallArg.toast
    assert.lengthOf(Object.keys(fourthCallToast), 3)
    assert.strictEqual(fourthCallToast.type, toastTypes.Success)
    assert.strictEqual(fourthCallToast.msg, `Uploaded ${fileName2}`)
    assert.isNumber(fourthCallToast.id)

    assert.isDefined(types.TRACK_UPLOADS_DELETE)
    const uploadedIds = new Set(uploadIds)
    const fifthDisptachCall = dispatchExpect.getCall(4)
    assert.isTrue(
      fifthDisptachCall.calledWithExactly({
        type: types.TRACK_UPLOADS_DELETE,
        deleteIds: uploadedIds,
        playlist: {
          ...uploadPlaylist,
          tracks: [],
          index: null
        }
      })
    )

    const sixthDisptachCall = dispatchExpect.getCall(5)
    assert.isTrue(
      sixthDisptachCall.calledWithExactly({
        type: types.TRACKS_UPDATE,
        libraryById: uploads
      })
    )

    dispatchMock.verify()
    playerMock.verify()
    wsMock.verify()
  })

  it('#tracksRemove()', () => {
    const deleteIndexes = [1, 0]
    const selection1 = new Map()
    selection1.set(1, track2.id)
    selection1.set(0, track1.id)
    const selection2 = new Map()
    selection2.set(2, track2.id)
    const playlists = {
      [testPlaylistName1]: {
        selection: selection1,
        tracks: [track1.id, track2.id],
        index: 1
      },
      [testPlaylistName2]: {
        selection: selection2,
        tracks: [track1.id, track2.id]
      }
    }
    const tracks = { library, playing: {}, playlists }
    const account = { rowsPerPage: 25 }

    const ws = new WavesSocket({})

    const thunk = actions.tracksRemove(testPlaylistName1)

    assert.isDefined(types.TRACKS_REMOVE)
    const action = {
      type: types.TRACKS_REMOVE,
      playlistName: testPlaylistName1,
      deleteIndexes,
      deletePlaying: false,
      selection: new Map(),
      index: null
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock
      .expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.TRACKS_REMOVE, {
        playlistName: testPlaylistName1,
        deleteIndexes
      })

    thunk(dispatchMock, () => ({ tracks, account }), { ws })

    dispatchMock.verify()
    wsMock.verify()
  })
})
