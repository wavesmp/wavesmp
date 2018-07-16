const { assert } = require('chai')

const actionTypes = require('waves-action-types')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')
const { TEST_CONTEXTMENU1: menu1, TEST_CONTEXTMENU2: menu2 } = require('waves-test-data')

const contextmenu = require('../src/contextmenu')

describe('#contextmenu()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(contextmenu, undefined, UNKNOWN_ACTION)
    assert.isArray(state)
    assert.lengthOf(state, 0)
  })

  it('set', () => {
    action = {
      type: actionTypes.CONTEXTMENU_SET,
      menu: menu1
    }
    state = assertNewState(contextmenu, state, action)

    assert.isArray(state)
    assert.lengthOf(state, 1)
    assert.strictEqual(state[0], menu1)
  })

  it('next', () => {
    action = {
      type: actionTypes.CONTEXTMENU_NEXT,
      menu: menu2
    }
    state = assertNewState(contextmenu, state, action)

    assert.isArray(state)
    assert.lengthOf(state, 2)
    assert.strictEqual(state[0], menu1)
    assert.strictEqual(state[1], menu2)
    assert.strictEqual(state[1].x, 'x1')
    assert.strictEqual(state[1].y, 'y1')
  })

  it('back', () => {
    action = { type: actionTypes.CONTEXTMENU_BACK }
    state = assertNewState(contextmenu, state, action)

    assert.isArray(state)
    assert.lengthOf(state, 1)
    assert.strictEqual(state[0], menu1)
  })

  it('reset', () => {
    action = { type: actionTypes.CONTEXTMENU_RESET }
    state = assertNewState(contextmenu, state, action)
    assert.isArray(state)
    assert.lengthOf(state, 0)
  })
})
