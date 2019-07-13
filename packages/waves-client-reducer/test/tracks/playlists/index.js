const { assert } = require('chai')
const mongoid = require('mongoid-js')

const actionTypes = require('waves-action-types')
const {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  UPLOAD_PLAYLIST,
  libTypes
} = require('waves-client-constants')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')
const {
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2,
  TEST_PLAYLIST_NAME1: playlistName1,
  TEST_PLAYLIST_NAME2: playlistName2,
  TEST_TRACK1_UPDATE: update1,
  TEST_SEARCH: testSearch
} = require('waves-test-data')

const playlists = require('../../../src/tracks/playlists')

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }

const testLib = {
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
    assert.isDefined(actionTypes.TRACKS_ADD)
    action = {
      type: actionTypes.TRACKS_ADD,
      lib: testLib,
      libType: libTypes.WAVES
    }
    state = assertNewState(playlists, state, action)
    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id, track2.id]
      }
    })
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

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id, track2.id]
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('library playlist track toggle', () => {
    action = {
      type: actionTypes.TRACK_TOGGLE,
      oldPlaylistName: null,
      playlistName: FULL_PLAYLIST,
      index: 1,
      track: track2
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id],
        index: 1
      }
    })
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
      nextTrack: { ...track1, index: 0 }
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id],
        index: 0
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2
      }
    })
  })

  it('library playlist search', () => {
    action = {
      type: actionTypes.PLAYLIST_SEARCH_UPDATE,
      name: FULL_PLAYLIST,
      search: testSearch
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id, track2.id],
        index: 0
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2
      }
    })
  })

  it('library sort key update', () => {
    action = {
      type: actionTypes.PLAYLIST_SORT,
      name: FULL_PLAYLIST,
      sortKey: 'artist',
      ascending: false,
      lib: testLib
    }

    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2
      }
    })
  })

  it('add playlistName1', () => {
    action = {
      type: actionTypes.PLAYLIST_ADD,
      playlistName: playlistName1,
      addTracks: [track1.id]
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2
      },
      [playlistName1]: {
        name: playlistName1,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('rename playlistName1 to playlistName2', () => {
    assert.isDefined(actionTypes.PLAYLIST_MOVE)
    action = {
      type: actionTypes.PLAYLIST_MOVE,
      src: playlistName1,
      dest: playlistName2
    }

    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id, track2.id, track1.id],
        index: 2
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('Remove from default playlist', () => {
    action = {
      type: actionTypes.TRACKS_REMOVE,
      playlistName: DEFAULT_PLAYLIST,
      deleteIndexes: [1, 0],
      selection: new Map(),
      index: 0
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: 0
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('copy default playlist to playlistName1', () => {
    action = {
      type: actionTypes.PLAYLIST_COPY,
      src: DEFAULT_PLAYLIST,
      dest: playlistName1
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: 0
      },
      [playlistName1]: {
        name: playlistName1,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: null
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('clear the default playlist', () => {
    action = {
      type: actionTypes.PLAYLIST_DELETE,
      playlistName: DEFAULT_PLAYLIST
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null
      },
      [playlistName1]: {
        name: playlistName1,
        selection: new Map(),
        search: '',
        tracks: [track1.id],
        index: null
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('delete playistName1', () => {
    action = { type: actionTypes.PLAYLIST_DELETE, playlistName: playlistName1 }
    state = assertNewState(playlists, state, action)
    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track2.id, track1.id],
        index: 1
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('delete track2', () => {
    action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track2.id])
    }
    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id],
        index: 0
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('add to uploads', () => {
    action = {
      type: actionTypes.TRACKS_ADD,
      lib: testLib,
      libType: libTypes.UPLOADS
    }

    state = assertNewState(playlists, state, action)

    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id],
        index: 0
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null
      },
      [UPLOAD_PLAYLIST]: {
        name: UPLOAD_PLAYLIST,
        sortKey: 'title',
        ascending: true,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id, track2.id]
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })

  it('delete uploads', () => {
    const playlistName = UPLOAD_PLAYLIST
    action = { type: actionTypes.PLAYLIST_DELETE, playlistName }
    state = assertNewState(playlists, state, action)
    assert.deepEqual(state, {
      [FULL_PLAYLIST]: {
        name: FULL_PLAYLIST,
        sortKey: 'artist',
        ascending: false,
        selection: new Map(),
        search: testSearch,
        tracks: [track1.id],
        index: 0
      },
      [DEFAULT_PLAYLIST]: {
        name: DEFAULT_PLAYLIST,
        selection: new Map(),
        search: '',
        tracks: [],
        index: null
      },
      [playlistName2]: {
        name: playlistName2,
        selection: new Map(),
        search: '',
        index: null,
        tracks: [track1.id]
      }
    })
  })
})
