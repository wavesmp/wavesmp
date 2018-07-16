const { assert } = require('chai')
const mongoid = require('mongoid-js')

const actionTypes = require('waves-action-types')
const { DEFAULT_PLAYLIST, FULL_PLAYLIST, UPLOAD_PLAYLIST } = require('waves-client-constants')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')
const { TEST_TRACK1: baseTrack1, TEST_TRACK2: baseTrack2,
        TEST_PLAYLIST_NAME1: playlistName1, TEST_PLAYLIST_NAME2: playlistName2,
        TEST_TRACK1_UPDATE: update1,
        TEST_SEARCH: testSearch } = require('waves-test-data')

const playlists = require('../../../src/tracks/playlists')

const track1 = {...baseTrack1, id: mongoid()}
const track2 = {...baseTrack2, id: mongoid()}


const libraryById = {
  [track1.id]: track1,
  [track2.id]: track2
}

describe('#playlists()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(playlists, undefined, UNKNOWN_ACTION)
    assert.isNull(state)
  })

  it('library playlist update', () => {
    action = { type: actionTypes.TRACKS_UPDATE, libraryById }
    state = assertNewState(playlists, state, action)
    assert.isObject(state)
    const playlistNames = Object.keys(state)
    assert.lengthOf(playlistNames, 1)
    const playlistName = playlistNames[0]

    const playlist = state[playlistName]

    const expected = {
      name: FULL_PLAYLIST,
      sortKey: 'title',
      ascending: true,
      selection: {},
      search: '',
      playId: null,
      tracks: [track1.id, track2.id]
    }
    assert.deepEqual(playlist, expected)
  })

  it('playlists update', () => {
    action = {
      type: actionTypes.PLAYLISTS_UPDATE,
      update: [
        {
          name: DEFAULT_PLAYLIST,
          tracks: [track1.id]
        }
      ]
    }
    state = assertNewState(playlists, state, action)

    const expected = {
      name: DEFAULT_PLAYLIST,
      selection: {},
      search: '',
      playId: null,
      tracks: [track1.id]
    }
    assert.deepEqual(state[DEFAULT_PLAYLIST], expected)
  })

  it('library playlist track toggle', () => {
    action = {
      type: actionTypes.TRACK_TOGGLE,
      oldPlaylistName: null,
      playlistName: FULL_PLAYLIST,
      playId: '1',
      track: track2
    }
    state = assertNewState(playlists, state, action)

    const expectedDefaultPlaylist = {
      name: DEFAULT_PLAYLIST,
      selection: {},
      search: '',
      tracks: [track1.id, track2.id],
      playId: '1'
    }
    assert.deepEqual(state[DEFAULT_PLAYLIST], expectedDefaultPlaylist)

    const expectedLibraryPlaylist = {
      name: FULL_PLAYLIST,
      sortKey: 'title',
      ascending: true,
      selection: {},
      search: '',
      tracks: [track1.id, track2.id],
      playId: '1'
    }
    assert.deepEqual(state[FULL_PLAYLIST], expectedLibraryPlaylist)

    assert.lengthOf(Object.keys(state), 2)
  })

  it('library playlist track next', () => {
    action = {
      type: actionTypes.TRACK_NEXT,
      playlistName: FULL_PLAYLIST,
      nextTrack: null
    }
    const newState = playlists(state, action)
    assert.strictEqual(state, newState)
  })

  it('library playlist track prev', () => {
    action = {
      type: actionTypes.TRACK_NEXT,
      playlistName: FULL_PLAYLIST,
      nextTrack: {...track1, playId: '0'}
    }
    state = assertNewState(playlists, state, action)

    const expectedDefaultPlaylist = {
      name: DEFAULT_PLAYLIST,
      selection: {},
      search: '',
      tracks: [track1.id, track2.id, track1.id],
      playId: '2'
    }
    assert.deepEqual(state[DEFAULT_PLAYLIST], expectedDefaultPlaylist)

    const expectedLibraryPlaylist = {
      name: FULL_PLAYLIST,
      sortKey: 'title',
      ascending: true,
      selection: {},
      search: '',
      tracks: [track1.id, track2.id],
      playId: '0'
    }
    assert.deepEqual(state[FULL_PLAYLIST], expectedLibraryPlaylist)

    assert.lengthOf(Object.keys(state), 2)
  })

  it('library playlist search', () => {
    action = {
      type: actionTypes.PLAYLIST_SEARCH_UPDATE,
      name: FULL_PLAYLIST,
      search: testSearch
    }
    state = assertNewState(playlists, state, action)

    const expectedLibraryPlaylist = {
      name: FULL_PLAYLIST,
      sortKey: 'title',
      ascending: true,
      selection: {},
      search: testSearch,
      tracks: [track1.id, track2.id],
      playId: '0'
    }
    assert.deepEqual(state[FULL_PLAYLIST], expectedLibraryPlaylist)
  })

  it('library sort key update', () => {
    action = {
      type: actionTypes.PLAYLIST_SORT,
      sortKey: 'artist',
      ascending: false,
      library: libraryById
    }
    state = assertNewState(playlists, state, action)

    const expectedLibraryPlaylist = {
      name: FULL_PLAYLIST,
      sortKey: 'artist',
      ascending: false,
      selection: {},
      search: testSearch,
      tracks: [track2.id, track1.id],
      playId: '1'
    }
    assert.deepEqual(state[FULL_PLAYLIST], expectedLibraryPlaylist)
  })

  it('add playlistName1', () => {
    action = {
      type: actionTypes.PLAYLIST_ADD,
      playlistName: playlistName1,
      addTracks: [track1.id]
    }
    state = assertNewState(playlists, state, action)

    const expectedPlaylist1 = {
      name: playlistName1,
      selection: {},
      search: '',
      playId: null,
      tracks: [track1.id]
    }
    assert.deepEqual(state[playlistName1], expectedPlaylist1)
    assert.lengthOf(Object.keys(state), 3)
  })

  it('rename playlistName1 to playlistName2', () => {
    assert.isDefined(actionTypes.PLAYLIST_MOVE)
    action = {
      type: actionTypes.PLAYLIST_MOVE,
      src: playlistName1,
      dest: playlistName2
    }
    state = assertNewState(playlists, state, action)

    const expectedPlaylist2 = {
      name: playlistName2,
      selection: {},
      search: '',
      playId: null,
      tracks: [track1.id]
    }
    assert.deepEqual(state[playlistName2], expectedPlaylist2)
    assert.lengthOf(Object.keys(state), 3)
    assert.isUndefined(state[playlistName1])
  })

  it('Remove from default playlist', () => {
    action = {
      type: actionTypes.PLAYLIST_REMOVE,
      playlistName: DEFAULT_PLAYLIST,
      deleteIndexes: [1, 0]
    }
    state = assertNewState(playlists, state, action)

    const expectedDefaultPlaylist = {
      name: DEFAULT_PLAYLIST,
      selection: {},
      search: '',
      tracks: [track1.id],
      playId: '0'
    }
    assert.deepEqual(state[DEFAULT_PLAYLIST], expectedDefaultPlaylist)
  })

  it('copy default playlist to playlistName1', () => {
    action = {
      type: actionTypes.PLAYLIST_COPY,
      src: DEFAULT_PLAYLIST,
      dest: playlistName1
    }
    state = assertNewState(playlists, state, action)

    const expectedPlaylist1 = {
      name: playlistName1,
      selection: {},
      search: '',
      tracks: [track1.id],
      playId: null
    }
    assert.deepEqual(state[playlistName1], expectedPlaylist1)
    assert.lengthOf(Object.keys(state), 4)
  })

  it('clear the default playlist', () => {
    action = {
      type: actionTypes.PLAYLIST_DELETE,
      playlistName: DEFAULT_PLAYLIST
    }
    state = assertNewState(playlists, state, action)

    const expectedDefaultPlaylist = {
      name: DEFAULT_PLAYLIST,
      selection: {},
      search: '',
      tracks: [],
      playId: null
    }
    assert.deepEqual(state[DEFAULT_PLAYLIST], expectedDefaultPlaylist)
    assert.lengthOf(Object.keys(state), 4)
  })

  it('delete playistName1', () => {
    action = { type: actionTypes.PLAYLIST_DELETE, playlistName: playlistName1 }
    state = assertNewState(playlists, state, action)
    assert.isUndefined(state[playlistName1])
    assert.lengthOf(Object.keys(state), 3)
  })

  it('delete track2', () => {
    action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track2.id])
    }
    state = assertNewState(playlists, state, action)

    const expectedLibraryPlaylist = {
      name: FULL_PLAYLIST,
      sortKey: 'artist',
      ascending: false,
      selection: {},
      search: testSearch,
      tracks: [track1.id],
      playId: '0'
    }
    assert.deepEqual(state[FULL_PLAYLIST], expectedLibraryPlaylist)
  })

  it('add to uploads', () => {
    const playlistName = UPLOAD_PLAYLIST
    assert.isUndefined(state[playlistName])
    const update = [track1, track2]
    action = { type: actionTypes.TRACK_UPLOADS_UPDATE, update }
    state = assertNewState(playlists, state, action)

    const expectedPlaylist = {
      name: playlistName,
      selection: {},
      search: '',
      playId: null,
      tracks: [track1.id, track2.id]
    }
    assert.deepEqual(state[playlistName], expectedPlaylist)
    assert.lengthOf(Object.keys(state), 4)
  })

  it('delete uploads', () => {
    const playlistName = UPLOAD_PLAYLIST
    action = { type: actionTypes.PLAYLIST_DELETE, playlistName }
    state = assertNewState(playlists, state, action)
    assert.isUndefined(state[playlistName])
    assert.lengthOf(Object.keys(state), 3)
  })

})
