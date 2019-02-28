const { assert } = require('chai')
const mongoid = require('mongoid-js')
const sinon = require('sinon')

const types = require('waves-action-types')
const { DEFAULT_PLAYLIST, FULL_PLAYLIST } = require('waves-client-constants')
const {
  TEST_PLAYLIST_NAME1: testPlaylistName,
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

const actions = require('../src/router')

describe('#router()', () => {
  it('Router change on non-playlist path', () => {
    const location = {
      pathname: '/uploads',
      search: testSearch
    }
    const thunk = actions.routerChange(location)

    thunk()
  })

  it('Router change on default playlist', () => {
    const location = {
      pathname: '/nowplaying',
      search: testSearch
    }
    const thunk = actions.routerChange(location)

    assert.isDefined(types.PLAYLIST_SEARCH_UPDATE)
    const action = {
      type: types.PLAYLIST_SEARCH_UPDATE,
      name: DEFAULT_PLAYLIST,
      search: testSearch
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    thunk(dispatchMock)
    dispatchMock.verify()
  })

  it('Router change on custom playlist', () => {
    const location = {
      pathname: `/playlist/${testPlaylistName}`,
      search: testSearch
    }
    const thunk = actions.routerChange(location)

    assert.isDefined(types.PLAYLIST_SEARCH_UPDATE)
    const action = {
      type: types.PLAYLIST_SEARCH_UPDATE,
      name: testPlaylistName,
      search: testSearch
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    thunk(dispatchMock)
    dispatchMock.verify()
  })

  it('Router change on library playlist', () => {
    const ascending = false
    const order = 'desc'
    const sortKey = 'testSortKey'
    const search = `?page=2&search=foobar&sortKey=${sortKey}&order=${order}`
    const location = { pathname: '/library', search }

    const thunk = actions.routerChange(location)

    assert.isDefined(types.PLAYLIST_SEARCH_UPDATE)
    const firstAction = {
      type: types.PLAYLIST_SEARCH_UPDATE,
      name: FULL_PLAYLIST,
      search
    }

    assert.isDefined(types.PLAYLIST_SORT)
    const secondAction = {
      type: types.PLAYLIST_SORT,
      library,
      name: FULL_PLAYLIST,
      sortKey,
      ascending
    }

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.twice()

    const getState = () => ({ tracks: { library } })
    thunk(dispatchMock, getState)

    const firstDispatchCall = dispatchExpect.firstCall
    assert.isTrue(firstDispatchCall.calledWithExactly(firstAction))

    const secondDispatchCall = dispatchExpect.secondCall
    assert.isTrue(secondDispatchCall.calledWithExactly(secondAction))

    dispatchMock.verify()
    dispatchMock.verify()
  })
})
