const { assert } = require('chai')
const formatTime = require('format-duration')
const mongoid = require('mongoid-js')
const { URLSearchParams } = require('url')
const sinon = require('sinon')

const types = require('waves-action-types')
const { DEFAULT_PLAYLIST, UPLOAD_PLAYLIST } = require('waves-client-constants')
const Player = require('waves-client-player')
const { SEARCH_QUERY_KEY } = require('waves-client-selectors')
const WavesSocket = require('waves-socket')
const { TEST_PLAYLIST_NAME1: testPlaylistName1, TEST_PLAYLIST_NAME2: testPlaylistName2,
        TEST_TRACK1: baseTrack1, TEST_TRACK2: baseTrack2 } = require('waves-test-data')

const track1 = {...baseTrack1, id: mongoid()}
const track2 = {...baseTrack2, id: mongoid()}
const library = {
  [track1.id]: track1,
  [track2.id]: track2
}

const actions = require('../../src/tracks')

describe('#tracks()', async () => {

  it('track toggle test playlist', async () => {
    const testPlayId = 'testPlayId'

    const ws = new WavesSocket({})
    const player = new Player({})

    const thunk = actions.trackToggle(track2.id, testPlaylistName2, testPlayId)

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock.expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_ADD,
        {playlistName: DEFAULT_PLAYLIST, trackIds: [track2.id]})

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('trackToggle')
      .once()
      .withExactArgs(track2)

    const playing = { playlist: testPlaylistName1 }
    const tracks = { playing, library }
    thunk(dispatchMock, () => ({ tracks }), { player, ws })

    dispatchMock.verify()
    playerMock.verify()
    wsMock.verify()

    const dispatchFirstCall = dispatchExpect.firstCall
    const dispatchArgs = dispatchFirstCall.args
    assert.lengthOf(dispatchArgs, 1)
    const dispatchArg = dispatchArgs[0]

    assert.lengthOf(Object.keys(dispatchArg), 6)
    assert.isDefined(types.TRACK_TOGGLE)
    assert.strictEqual(dispatchArg.type, types.TRACK_TOGGLE)
    assert.strictEqual(dispatchArg.playlistName, testPlaylistName2)
    assert.strictEqual(dispatchArg.playId, testPlayId)
    assert.deepEqual(dispatchArg.track, track2)
    assert.strictEqual(dispatchArg.oldPlaylistName, testPlaylistName1)
    const buffer = 100 // 0.1s
    assert.closeTo(dispatchArg.startDate.getTime(), new Date().getTime(), buffer)
  })

  it('track toggle default playlist', async () => {
    const testPlayId = 'testPlayId'

    const player = new Player({})

    const thunk = actions.trackToggle(track2.id, DEFAULT_PLAYLIST, testPlayId)

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('trackToggle')
      .once()
      .withExactArgs(track2)

    const playing = { playlist: testPlaylistName1 }
    const tracks = { playing, library }
    thunk(dispatchMock, () => ({ tracks }), { player })

    dispatchMock.verify()
    playerMock.verify()

    const dispatchFirstCall = dispatchExpect.firstCall
    const dispatchArgs = dispatchFirstCall.args
    assert.lengthOf(dispatchArgs, 1)
    const dispatchArg = dispatchArgs[0]

    assert.lengthOf(Object.keys(dispatchArg), 6)
    assert.isDefined(types.TRACK_TOGGLE)
    assert.strictEqual(dispatchArg.type, types.TRACK_TOGGLE)
    assert.strictEqual(dispatchArg.playlistName, DEFAULT_PLAYLIST)
    assert.strictEqual(dispatchArg.playId, testPlayId)
    assert.deepEqual(dispatchArg.track, track2)
    assert.strictEqual(dispatchArg.oldPlaylistName, testPlaylistName1)
    const buffer = 100 // 0.1s
    assert.closeTo(dispatchArg.startDate.getTime(), new Date().getTime(), buffer)
  })

  it('track next on playlist without search', async () => {
    const ws = new WavesSocket({})
    const player = new Player({})

    const thunk = actions.trackNext(URLSearchParams)

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock.expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.PLAYLIST_ADD,
        {playlistName: DEFAULT_PLAYLIST, trackIds: [track2.id]})

    const isPlaying = true
    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('trackNext')
      .once()
      .withExactArgs({...track2, playId: '1'}, isPlaying)

    const playlistName = testPlaylistName1
    const playing = { playlist: playlistName, isPlaying, shuffle: false }
    const playlist = {
      tracks: [track1.id, track2.id],
      playId: '0',
      search: ''
    }
    const playlists = {[playlistName]: playlist}
    const tracks = { playing, playlists, library }
    thunk(dispatchMock, () => ({ tracks }), { player, ws })

    dispatchMock.verify()
    playerMock.verify()
    wsMock.verify()

    const dispatchFirstCall = dispatchExpect.firstCall
    const dispatchArgs = dispatchFirstCall.args
    assert.lengthOf(dispatchArgs, 1)
    const dispatchArg = dispatchArgs[0]

    assert.lengthOf(Object.keys(dispatchArg), 4)
    assert.isDefined(types.TRACK_NEXT)
    assert.strictEqual(dispatchArg.type, types.TRACK_NEXT)
    assert.deepEqual(dispatchArg.nextTrack, {...track2, playId: '1'})
    assert.strictEqual(dispatchArg.playlistName, playlistName)
    const buffer = 100 // 0.1s
    assert.closeTo(dispatchArg.startDate.getTime(), new Date().getTime(), buffer)
  })

  it('track prev on default playlist with search', async () => {
    const searchString = 'thisisaveryspecificsearchstring'
    const search = `${SEARCH_QUERY_KEY}=${searchString}`

    const track1Copy = {...track1, title: searchString}
    const track1Time = formatTime(track1Copy.duration * 1000)
    const expectedTrack1 = {...track1Copy, playId: '0', time: track1Time}
    const track2Copy = {...track2, title: searchString}

    const libraryCopy = {
      [track1Copy.id]: track1Copy,
      [track2Copy.id]: track2Copy
    }

    const player = new Player({})

    const thunk = actions.trackPrevious(URLSearchParams)

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const isPlaying = true
    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('trackNext')
      .once()
      .withExactArgs(expectedTrack1, isPlaying)

    const playlistName = DEFAULT_PLAYLIST
    const playing = { playlist: playlistName, isPlaying, shuffle: false }
    const playlist = {
      tracks: [track1Copy.id, track2Copy.id],
      playId: '1',
      search
    }
    const playlists = {[playlistName]: playlist}
    const tracks = { playing, playlists, library: libraryCopy }
    thunk(dispatchMock, () => ({ tracks }), { player })

    dispatchMock.verify()
    playerMock.verify()

    const dispatchFirstCall = dispatchExpect.firstCall
    const dispatchArgs = dispatchFirstCall.args
    assert.lengthOf(dispatchArgs, 1)
    const dispatchArg = dispatchArgs[0]

    assert.lengthOf(Object.keys(dispatchArg), 4)
    assert.isDefined(types.TRACK_NEXT)
    assert.strictEqual(dispatchArg.type, types.TRACK_NEXT)
    assert.deepEqual(dispatchArg.nextTrack, expectedTrack1)
    assert.strictEqual(dispatchArg.playlistName, playlistName)
    const buffer = 100 // 0.1s
    assert.closeTo(dispatchArg.startDate.getTime(), new Date().getTime(), buffer)
  })

  it('trackUploadsUpdate()', async () => {
    const update = [track1, track2]
    assert.isDefined(types.TRACK_UPLOADS_UPDATE)
    const expectedAction = { type: types.TRACK_UPLOADS_UPDATE, update }
    assert.deepEqual(actions.trackUploadsUpdate(update), expectedAction)
  })

  it('initial library update', async () => {
    const library = null
    const getState = () => ({tracks: {library}})
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
    const track2Copy = {...track2}
    track2Copy.title = ''

    const library = { [track1.id]: track1 }
    const getState = () => ({tracks: {library}})
    const update = [track2Copy]
    const updatedLibrary = {
      [track1.id]: track1,
      [track2Copy.id]: {...track2Copy, title: 'Unknown title'}
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
    const uploads = [track1, track2]
    const playerUploads = [
      {...track1, source: 's3'},
      {...track2, source: 's3'}
    ]

    const thunk = actions.tracksUpload(sourceType, uploads)

    assert.isDefined(types.PLAYLIST_DELETE)
    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(
      { type: types.PLAYLIST_DELETE, playlistName: UPLOAD_PLAYLIST })

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('upload')
      .once().withExactArgs(sourceType, uploads)
      .returns(playerUploads)

    assert.isDefined(types.TRACKS_UPDATE)
    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock.expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.TRACKS_UPDATE,
        {tracks: playerUploads})

    await thunk(dispatchMock, undefined, { player, ws })

    playerMock.verify()
    wsMock.verify()
  })
})
