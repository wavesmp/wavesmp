const { assert } = require('chai')

const actionTypes = require('waves-action-types')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')

const menu = require('../src/menu')

const menu1 = { transform: 'transform1' }

describe('#menu()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(menu, undefined, UNKNOWN_ACTION)
    assert.isArray(state)
    assert.lengthOf(state, 0)
  })

  it('set', () => {
    action = {
      type: actionTypes.MENU_SET,
      menu: menu1,
    }
    state = assertNewState(menu, state, action)

    assert.isArray(state)
    assert.lengthOf(state, 1)
    assert.strictEqual(state[0], menu1)
  })

  it('next', () => {
    action = {
      type: actionTypes.MENU_NEXT,
      menu: {},
    }
    state = assertNewState(menu, state, action)

    assert.isArray(state)
    assert.lengthOf(state, 2)
    assert.strictEqual(state[0], menu1)
    assert.deepEqual(state[1], menu1)
  })

  it('back', () => {
    action = { type: actionTypes.MENU_BACK }
    state = assertNewState(menu, state, action)

    assert.isArray(state)
    assert.lengthOf(state, 1)
    assert.strictEqual(state[0], menu1)
  })

  it('reset', () => {
    action = { type: actionTypes.MENU_RESET }
    state = assertNewState(menu, state, action)
    assert.isArray(state)
    assert.lengthOf(state, 0)
  })
})
