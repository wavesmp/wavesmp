const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../../../src/tracks/playlists/selection')

describe('#selection()', () => {
  it('#selectionAdd()', () => {
    assert.isDefined(types.SELECTION_ADD)
    const name = 'testName'
    const index = 'testIndex'
    const trackId = 'testTrackId'
    const expectedAction = { type: types.SELECTION_ADD, name, index, trackId }
    assert.deepEqual(actions.selectionAdd(name, index, trackId), expectedAction)
  })

  it('#selectionClearAndAdd()', () => {
    assert.isDefined(types.SELECTION_CLEAR_AND_ADD)
    const name = 'testName'
    const index = 'testIndex'
    const trackId = 'testTrackId'
    const displayItems = [trackId]
    const expectedAction = {
      type: types.SELECTION_CLEAR_AND_ADD,
      name,
      index,
      trackId,
      displayItems
    }
    assert.deepEqual(
      actions.selectionClearAndAdd(name, index, trackId, displayItems),
      expectedAction
    )
  })

  it('#selectionRange()', () => {
    assert.isDefined(types.SELECTION_RANGE)
    const name = 'testName'
    const startIndex = 'testStartIndex'
    const endIndex = 'testEndIndex'
    const displayItems = 'testDisplayItems'
    const expectedAction = {
      type: types.SELECTION_RANGE,
      name,
      startIndex,
      endIndex,
      displayItems
    }
    const actualAction = actions.selectionRange(
      name,
      startIndex,
      endIndex,
      displayItems
    )
    assert.deepEqual(actualAction, expectedAction)
  })

  it('#selectionRemove()', () => {
    assert.isDefined(types.SELECTION_REMOVE)
    const name = 'testName'
    const index = 'testIndex'
    const expectedAction = { type: types.SELECTION_REMOVE, name, index }
    assert.deepEqual(actions.selectionRemove(name, index), expectedAction)
  })
})
