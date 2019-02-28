const { assert } = require('chai')

const actionTypes = require('waves-action-types')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')

const sidebar = require('../src/sidebar')

describe('#sidebar()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(sidebar, undefined, UNKNOWN_ACTION)
    assert.strictEqual(state, 'main')
  })

  it('set sidebar mode', () => {
    action = { type: actionTypes.SIDEBAR_MODE_SET, mode: 'mode' }
    state = assertNewState(sidebar, state, action)

    assert.strictEqual(state, 'mode')
  })
})
