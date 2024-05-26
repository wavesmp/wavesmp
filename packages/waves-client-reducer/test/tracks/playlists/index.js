const { assert } = require('chai')
const mongoid = require('mongoid-js')

const actionTypes = require('waves-action-types')
const {
  NOW_PLAYING_NAME,
  LIBRARY_NAME,
  UPLOADS_NAME,
} = require('waves-client-constants')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')
const {
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2,
  TEST_PLAYLIST_NAME1: playlistName1,
  TEST_PLAYLIST_NAME2: playlistName2,
  TEST_SEARCH: testSearch,
} = require('waves-test-data')

const playlists = require('../../../src/tracks/playlists')

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }

const testLib = {
  [track1.id]: track1,
  [track2.id]: track2,
}

describe('#playlists()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(playlists, undefined, UNKNOWN_ACTION)
    assert.isNull(state)
  })

  it('library playlist update', () => {
    assert.isDefined(actionTypes.TRACKS_ADD)
    action = {
      type: actionTypes.TRACKS_ADD,
      lib: testLib,
      libName: LIBRARY_NAME,
    }
    state = assertNewState(playlists, state, action)
    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id, track2.id],
      },
    })
  })

  it('playlists update', () => {
    action = {
      type: actionTypes.PLAYLISTS_UPDATE,
      update: [
        {
          name: NOW_PLAYING_NAME,
          tracks: [track1.id],
        },
      ],
    }

    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id, track2.id],
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('library playlist track toggle', () => {
    action = {
      type: actionTypes.TRACK_TOGGLE,
      oldPlaylistName: null,
      playlistName: LIBRARY_NAME,
      index: 1,
      track: track2,
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id],
        index: 1,
      },
    })
  })

  it('library playlist track next', () => {
    action = {
      type: actionTypes.TRACK_NEXT,
      playlistName: LIBRARY_NAME,
      nextTrack: null,
    }
    const newState = playlists(state, action)
    assert.strictEqual(state, newState)
  })

  it('library playlist track prev', () => {
    action = {
      type: actionTypes.TRACK_NEXT,
      playlistName: LIBRARY_NAME,
      nextTrack: { ...track1, index: 0 },
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id],
        index: 0,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2,
      },
    })
  })

  it('library playlist search', () => {
    action = {
      type: actionTypes.PLAYLIST_SEARCH_UPDATE,
      name: LIBRARY_NAME,
      search: testSearch,
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id, track2.id],
        index: 0,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2,
      },
    })
  })

  it('library sort key update', () => {
    action = {
      type: actionTypes.PLAYLIST_SORT,
      name: LIBRARY_NAME,
      sortKey: 'artist',
      ascending: false,
      lib: testLib,
    }

    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2,
      },
    })
  })

  it('add playlistName1', () => {
    action = {
      type: actionTypes.PLAYLIST_ADD,
      playlistName: playlistName1,
      addTracks: [track1.id],
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2,
      },
      [playlistName1]: {
        name: playlistName1,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('rename playlistName1 to playlistName2', () => {
    assert.isDefined(actionTypes.PLAYLIST_MOVE)
    action = {
      type: actionTypes.PLAYLIST_MOVE,
      src: playlistName1,
      dest: playlistName2,
    }

    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2,
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('Remove from default playlist', () => {
    action = {
      type: actionTypes.TRACKS_REMOVE,
      playlistName: NOW_PLAYING_NAME,
      deleteIndexes: [1, 0],
      selection: new Map(),
      index: 0,
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: 0,
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('copy default playlist to playlistName1', () => {
    action = {
      type: actionTypes.PLAYLIST_COPY,
      src: NOW_PLAYING_NAME,
      dest: playlistName1,
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: 0,
      },
      [playlistName1]: {
        name: playlistName1,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: null,
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('clear the default playlist', () => {
    action = {
      type: actionTypes.PLAYLIST_DELETE,
      playlistName: NOW_PLAYING_NAME,
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null,
      },
      [playlistName1]: {
        name: playlistName1,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: null,
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('delete playistName1', () => {
    action = { type: actionTypes.PLAYLIST_DELETE, playlistName: playlistName1 }
    state = assertNewState(playlists, state, action)
    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null,
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('delete track2', () => {
    action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track2.id]),
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id],
        index: 0,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null,
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('add to uploads', () => {
    action = {
      type: actionTypes.TRACKS_ADD,
      lib: testLib,
      libName: UPLOADS_NAME,
    }

    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id],
        index: 0,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null,
      },
      [UPLOADS_NAME]: {
        name: UPLOADS_NAME,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id, track2.id],
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })

  it('delete uploads', () => {
    const playlistName = UPLOADS_NAME
    action = { type: actionTypes.PLAYLIST_DELETE, playlistName }
    state = assertNewState(playlists, state, action)
    assert.deepEqual(state, {
      [LIBRARY_NAME]: {
        name: LIBRARY_NAME,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id],
        index: 0,
      },
      [NOW_PLAYING_NAME]: {
        name: NOW_PLAYING_NAME,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null,
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id],
      },
    })
  })
})
