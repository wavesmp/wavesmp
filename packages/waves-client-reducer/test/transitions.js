const { assert } = require('chai')

const actionTypes = require('waves-action-types')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')

const transitions = require('../src/transitions')

describe('#transitions()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(transitions, undefined, UNKNOWN_ACTION)
    assert.isFalse(state)
  })

  it('set to true', () => {
    action = { type: actionTypes.TRANSITION_MAIN_SET, on: true }
    state = assertNewState(transitions, state, action)
    assert.isTrue(state)
  })

})
