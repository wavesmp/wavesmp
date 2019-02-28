const { assert } = require('chai')

const actionTypes = require('waves-action-types')

const { assertNewState } = require('waves-test-util')
const { TEST_PLAYLIST_NAME1: playlistName } = require('waves-test-data')

const selection = require('../../../src/tracks/playlists/selection')

describe('#selection()', () => {
  let state = { name: playlistName, selection: {} }
  let action

  it('Initial clear and add', () => {
    const action = {
      type: actionTypes.SELECTION_CLEAR_AND_ADD,
      playId: '0',
      trackId: 'trackId0'
    }
    state = assertNewState(selection[action.type], state, action)
    assert.deepEqual(state.selection, { '0': 'trackId0' })
  })

  it('selection add', () => {
    const action = {
      type: actionTypes.SELECTION_ADD,
      playId: '1',
      trackId: 'trackId1'
    }
    state = assertNewState(selection[action.type], state, action)
    const expectedSelection = {
      '0': 'trackId0',
      '1': 'trackId1'
    }
    assert.deepEqual(state.selection, expectedSelection)
  })

  it('selection remove', () => {
    const action = {
      type: actionTypes.SELECTION_REMOVE,
      playId: '0'
    }
    state = assertNewState(selection[action.type], state, action)
    const expectedSelection = {
      '1': 'trackId1'
    }
    assert.deepEqual(state.selection, expectedSelection)
  })

  it('selection range', () => {
    const items = [...Array(10).keys()].map((_, i) => {
      i += 10
      return {
        playId: i + '',
        id: `trackId${i}`
      }
    })

    const action = {
      type: actionTypes.SELECTION_RANGE,
      displayItems: items,
      startPlayId: '12',
      endPlayId: '15'
    }
    state = assertNewState(selection[action.type], state, action)
    const expectedSelection = {
      '1': 'trackId1',
      '12': 'trackId12',
      '13': 'trackId13',
      '14': 'trackId14',
      '15': 'trackId15'
    }
    assert.deepEqual(state.selection, expectedSelection)
  })

  it('clear and add', () => {
    const action = {
      type: actionTypes.SELECTION_CLEAR_AND_ADD,
      playId: '5',
      trackId: 'trackId5'
    }
    state = assertNewState(selection[action.type], state, action)
    assert.deepEqual(state.selection, { '5': 'trackId5' })
  })
})
