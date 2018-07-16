const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../../../src/tracks/playlists/selection')

describe('#selection()', () => {

  it('#selectionAdd()', () => {
    assert.isDefined(types.SELECTION_ADD)
    const name = 'testName'
    const playId = 'testPlayId'
    const trackId = 'testTrackId'
    const expectedAction = { type: types.SELECTION_ADD, name, playId, trackId }
    assert.deepEqual(actions.selectionAdd(name, playId, trackId), expectedAction)
  })

  it('#selectionClearAndAdd()', () => {
    assert.isDefined(types.SELECTION_CLEAR_AND_ADD)
    const name = 'testName'
    const playId = 'testPlayId'
    const trackId = 'testTrackId'
    const expectedAction = {
      type: types.SELECTION_CLEAR_AND_ADD,
      name,
      playId,
      trackId
    }
    assert.deepEqual(actions.selectionClearAndAdd(name, playId, trackId), expectedAction)
  })

  it('#selectionRange()', () => {
    assert.isDefined(types.SELECTION_RANGE)
    const name = 'testName'
    const startPlayId = 'testStartPlayId'
    const endPlayId = 'testEndPlayId'
    const displayItems = 'testDisplayItems'
    const expectedAction = {
      type: types.SELECTION_RANGE,
      name,
      startPlayId,
      endPlayId,
      displayItems
    }
    const actualAction = actions.selectionRange(
      name, startPlayId, endPlayId, displayItems)
    assert.deepEqual(actualAction, expectedAction)
  })

  it('#selectionRemove()', () => {
    assert.isDefined(types.SELECTION_REMOVE)
    const name = 'testName'
    const playId = 'testPlayId'
    const expectedAction = { type: types.SELECTION_REMOVE, name, playId }
    assert.deepEqual(actions.selectionRemove(name, playId), expectedAction)
  })

})
