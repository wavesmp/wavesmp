const { assert } = require('chai')
const zip = require('lodash.zip')
const mongoid = require('mongoid-js')
const { URLSearchParams } = require('url')

const { DEFAULT_PLAYLIST, FULL_PLAYLIST } = require('waves-client-constants')
const {
  TEST_SEARCH: testSearch,
  TEST_PLAYLIST_NAME1: testPlaylistName,
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2,
  TEST_INDEX: testIndex,
  TEST_SELECTION: testSelection,
  TEST_SORT_KEY: testSortKey,
  TEST_ASCENDING: testAscending
} = require('waves-test-data')

const {
  getDefaultPlaylistSearch,
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors
} = require('../')

const ORDER_QUERY_KEY = 'order'
const SEARCH_QUERY_KEY = 'search'
const SORT_KEY_QUERY_KEY = 'sortKey'

const DEFAULT_ASCENDING = true
const DEFAULT_SORT_KEY = 'title'
const DEFAULT_SEARCH_STRING = ''

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }

const libType = 'testLibType'
const testLib = {
  [track1.id]: track1,
  [track2.id]: track2
}
const libraries = {
  [libType]: testLib
}

describe('waves-client-selectors', () => {
  const playlistNames = [DEFAULT_PLAYLIST, FULL_PLAYLIST]
  const getPlaylistSearchFuncs = [
    getDefaultPlaylistSearch,
    getLibraryPlaylistSearch
  ]

  const combined = zip(playlistNames, getPlaylistSearchFuncs)

  for (const [playlistName, getPlaylistSearch] of combined) {
    describe(`get ${playlistName} playlist search`, () => {
      it('playlists is null', () => {
        const tracks = {
          playlists: null
        }
        const state = { tracks }
        const search = getPlaylistSearch(state)
        assert.strictEqual(search, '')
      })

      it('playlist is null', () => {
        const tracks = {
          playlists: {}
        }
        const state = { tracks }
        const search = getPlaylistSearch(state)
        assert.strictEqual(search, '')
      })

      it('Search is empty string', () => {
        const tracks = {
          playlists: {
            [playlistName]: {
              search: ''
            }
          }
        }
        const state = { tracks }
        const search = getPlaylistSearch(state)
        assert.strictEqual(search, '')
      })

      it('test search string', () => {
        const tracks = {
          playlists: {
            [playlistName]: {
              search: testSearch
            }
          }
        }
        const state = { tracks }
        const search = getPlaylistSearch(state)
        assert.strictEqual(search, testSearch)
      })
    })
  }

  describe('#getOrCreatePlaylistSelectors()', () => {
    const {
      getRouterSearchString,
      getRouterAscending,
      getRouterSortKey,
      getPlaylistProps,
      getSearchItems
    } = getOrCreatePlaylistSelectors(testPlaylistName, URLSearchParams, libType)

    describe('#getPlaylistProps()', () => {
      it('playlist is null', () => {
        const tracks = {
          playlists: null,
          libraries
        }
        const state = { tracks, account: { rowsPerPage: 25 } }
        const props = getPlaylistProps(state, '')
        assert.deepEqual(props, { loaded: false })
      })

      it('playlist is missing', () => {
        const playlists = {}
        const tracks = { playlists, libraries }
        const state = { tracks, account: { rowsPerPage: 25 } }
        const props = getPlaylistProps(state)
        assert.deepEqual(props, { loaded: false })
      })

      it('playlist exists', () => {
        const playlist = {
          tracks: [track1.id],
          index: testIndex,
          selection: testSelection,
          sortKey: testSortKey,
          ascending: testAscending
        }
        const playlists = {
          [testPlaylistName]: playlist
        }

        const tracks = { playlists, libraries }
        const state = { tracks, account: { rowsPerPage: 25 } }
        const props = getPlaylistProps(state, '')
        const expected = {
          loaded: true,
          index: testIndex,
          selection: testSelection,
          sortKey: testSortKey,
          ascending: testAscending,
          numItems: 1,
          currentPage: 0,
          lastPage: 0,
          displayItems: [
            {
              ...track1,
              index: 0,
              time: '1:01'
            }
          ]
        }
        assert.deepEqual(props, expected)
      })
    })

    describe('router values', () => {
      it(`${SEARCH_QUERY_KEY} default value`, () => {
        assert.strictEqual(
          getRouterSearchString(null, ''),
          DEFAULT_SEARCH_STRING
        )
      })

      it(`${ORDER_QUERY_KEY} default value`, () => {
        assert.strictEqual(getRouterAscending(null, ''), DEFAULT_ASCENDING)
      })

      it(`${SORT_KEY_QUERY_KEY} default value`, () => {
        assert.strictEqual(getRouterSortKey(null, ''), DEFAULT_SORT_KEY)
      })

      it(`${SEARCH_QUERY_KEY} value`, () => {
        const expectedParam = 'dummy'
        const search = `foo=bar&${SEARCH_QUERY_KEY}=${expectedParam}&hi=bye`
        assert.strictEqual(getRouterSearchString(null, search), expectedParam)
      })

      it(`${ORDER_QUERY_KEY} true value`, () => {
        const param = 'asc'
        const search = `foo=bar&${ORDER_QUERY_KEY}=${param}&hi=bye`
        assert.strictEqual(getRouterAscending(null, search), true)
      })

      it(`${ORDER_QUERY_KEY} false value`, () => {
        const param = 'desc'
        const search = `foo=bar&${ORDER_QUERY_KEY}=${param}&hi=bye`
        assert.strictEqual(getRouterAscending(null, search), false)
      })

      it(`${SORT_KEY_QUERY_KEY} value`, () => {
        const expectedParam = 'dummy'
        const search = `foo=bar&${SORT_KEY_QUERY_KEY}=${expectedParam}&hi=bye`
        assert.strictEqual(getRouterSortKey(null, search), expectedParam)
      })
    })

    describe('#getSearchItems()', () => {
      it('search has 0 hits', () => {
        const searchString = 'thisdoesnotmatchanything'
        const search = `${SEARCH_QUERY_KEY}=${searchString}`
        const playlists = {
          [testPlaylistName]: {
            tracks: [track1.id, track2.id]
          }
        }
        const tracks = { playlists, libraries }
        const state = { tracks }
        const searchItems = getSearchItems(state, search)
        assert.lengthOf(searchItems, 0)
      })

      it('search has a hit', () => {
        const searchString = 'thisisaveryspecificsearchstring'

        const track1Copy = { ...track1, title: searchString }
        const libCopy = {...libraries[libType], [track1Copy.id]: track1Copy }
        const librariesCopy = { ...libraries, [libType]: libCopy }

        const search = `${SEARCH_QUERY_KEY}=${searchString}`
        const playlists = {
          [testPlaylistName]: {
            tracks: [track1Copy.id, track2.id]
          }
        }
        const tracks = { playlists, libraries: librariesCopy }
        const state = { tracks }
        const searchItems = getSearchItems(state, search)
        assert.lengthOf(searchItems, 1)
        const actualTrack = searchItems[0]
        assert.strictEqual(actualTrack.id, track1Copy.id)
      })
    })
  })
})
