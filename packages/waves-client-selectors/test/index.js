const { assert } = require('chai')
const zip = require('lodash.zip')
const mongoid = require('mongoid-js')
const { URLSearchParams } = require('url')

const { DEFAULT_PLAYLIST, FULL_PLAYLIST } = require('waves-client-constants')
const { TEST_SEARCH: testSearch,
        TEST_PLAYLIST_NAME1: testPlaylistName,
        TEST_TRACK1: baseTrack1, TEST_TRACK2: baseTrack2 } = require('waves-test-data')

const { getDefaultPlaylistSearch,
        getLibraryPlaylistSearch,
        getOrCreatePlaylistSelectors,
        SEARCH_QUERY_KEY,
        SORT_KEY_QUERY_KEY,
        ORDER_QUERY_KEY } = require('../')


const track1 = {...baseTrack1, id: mongoid()}
const track2 = {...baseTrack2, id: mongoid()}

const library = {
  [track1.id]: track1,
  [track2.id]: track2
}


describe('waves-client-selectors', () => {
  const playlistNames = [
    DEFAULT_PLAYLIST,
    FULL_PLAYLIST
  ]
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
        const search = getPlaylistSearch(tracks)
        assert.isNull(search)
      })

      it('playlist is null', () => {
        const tracks = {
          playlists: {}
        }
        const search = getPlaylistSearch(tracks)
        assert.isNull(search)
      })

      it('Search is empty string', () => {
        const tracks = {
          playlists: {
            [playlistName]: {
              search: ''
            }
          }
        }
        const search = getPlaylistSearch(tracks)
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
        const search = getPlaylistSearch(tracks)
        assert.strictEqual(search, testSearch)
      })

    })
  }

  describe('#getOrCreatePlaylistSelectors()', () => {

    const { getRouterSearchString,
            getRouterOrder,
            getRouterSortKey,
            getPlaylist,
            getPlaylistSearchString,
            getSearchItems } = getOrCreatePlaylistSelectors(testPlaylistName, URLSearchParams)

    describe('#getPlaylist()', () => {

      it('playlists is null', () => {
        const tracks = {
          playlists: null
        }
        const search = getPlaylist(tracks)
        assert.isNull(search)
      })

      it('playlist is missing', () => {
        const playlists = {}
        const tracks = { playlists }
        const playlist = getPlaylist(tracks)
        assert.isUndefined(playlist)
      })

      it('playlist exists', () => {
        const playlist = {}
        const playlists = {
          [testPlaylistName]: playlist
        }
        const tracks = { playlists }
        const actualPlaylist = getPlaylist(tracks)
        assert.strictEqual(actualPlaylist, playlist)
      })

    })

    describe('#getPlaylistSearchString()', () => {

      it('dummy search string', () => {
        const expectedSearchString = 'dummy'
        const playlist = {search: `foo=bar&search=${expectedSearchString}&hi=bye`}
        const playlists = {
          [testPlaylistName]: playlist
        }
        const tracks = { playlists }
        const actualSearchString = getPlaylistSearchString(tracks)
        assert.strictEqual(expectedSearchString, actualSearchString)
      })

    })

    const queryKeys = [SEARCH_QUERY_KEY, ORDER_QUERY_KEY, SORT_KEY_QUERY_KEY ]
    const getRouterParamFuncs = [getRouterSearchString, getRouterOrder, getRouterSortKey]
    for (const [queryKey, getRouterParam] of zip(queryKeys, getRouterParamFuncs)) {
      describe(`get router param ${queryKey}`, () => {

        it('empty param', () => {
          const search = ''
          const routerParam = getRouterParam(null, search)
          assert.isNull(routerParam)
        })

        it(`dummy ${queryKey}`, () => {
          const expectedParam = 'dummy'
          const search = `foo=bar&${queryKey}=${expectedParam}&hi=bye`
          const routerParam = getRouterParam(null, search)
          assert.strictEqual(routerParam, expectedParam)
        })

      })

    }

    describe('#getSearchItems()', () => {
      it('search has 0 hits', () => {
        const searchString = 'thisdoesnotmatchanything'
        const search = `${SEARCH_QUERY_KEY}=${searchString}`
        const playlists = {
          [testPlaylistName]: {
            tracks: [track1.id, track2.id]
          }
        }
        const tracks = { playlists, library }
        const searchItems = getSearchItems(tracks, search)
        assert.lengthOf(searchItems, 0)
      })

      it('search has a hit', () => {
        const searchString = 'thisisaveryspecificsearchstring'

        const track1Copy = {...track1}
        track1Copy.title = searchString

        const libraryCopy = {...library, [track1Copy.id]: track1Copy}

        const search = `${SEARCH_QUERY_KEY}=${searchString}`
        const playlists = {
          [testPlaylistName]: {
            tracks: [track1Copy.id, track2.id]
          }
        }
        const tracks = { playlists, library: libraryCopy }
        const searchItems = getSearchItems(tracks, search)
        assert.lengthOf(searchItems, 1)
        const actualTrack = searchItems[0]
        assert.strictEqual(actualTrack.id, track1Copy.id)
      })
    })
  })
})
