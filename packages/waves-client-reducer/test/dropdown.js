const { assert } = require('chai')

const actionTypes = require('waves-action-types')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')
const { TEST_DROPDOWN: testDropdown } = require('waves-test-data')

const dropdown = require('../src/dropdown')

describe('#dropdown()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(dropdown, undefined, UNKNOWN_ACTION)
    assert.isNull(state)
  })

  it('set to dropdown', () => {
    action = { type: actionTypes.DROPDOWN_SET, dropdown: testDropdown }
    state = assertNewState(dropdown, state, action)

    assert.strictEqual(state, testDropdown)
  })

  it('set to null', () => {
    action = { type: actionTypes.DROPDOWN_SET, dropdown: null }
    state = assertNewState(dropdown, state, action)

    assert.isNull(state)
  })

})
