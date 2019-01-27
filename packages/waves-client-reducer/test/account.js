const { assert } = require('chai')

const actionTypes = require('waves-action-types')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')
const { TEST_USER1: user } = require('waves-test-data')

const account = require('../src/account')

describe('#account()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(account, undefined, UNKNOWN_ACTION)
    assert.isObject(state)
    assert.lengthOf(Object.keys(state), 5)
    const { columns, rowsPerPage, user, fetchingUser } = state
    assert.strictEqual(columns, null)
    assert.strictEqual(rowsPerPage, null)
    assert.strictEqual(user, null)
    assert.strictEqual(fetchingUser, true)
  })

  it('account login', () => {
    action = { type: actionTypes.ACCOUNT_LOGIN, user }
    state = assertNewState(account, state, action)

    assert.isObject(state)
    assert.lengthOf(Object.keys(state), 5)
    assert.strictEqual(state.user, user)
    assert.strictEqual(state.fetchingUser, false)
  })

  it('set account settings', () => {
    const columns = ['Name', 'Title']
    const rowsPerPage = 50
    const theme = 'testTheme'
    action = { type: actionTypes.ACCOUNT_SET_SETTINGS, columns, rowsPerPage, theme }
    state = assertNewState(account, state, action)

    assert.isObject(state)
    assert.lengthOf(Object.keys(state), 5)
    assert.strictEqual(state.columns, columns)
    assert.strictEqual(state.rowsPerPage, rowsPerPage)
    assert.strictEqual(state.theme, theme)
  })

  it('set account fetchingUser', () => {
    const fetchingUser = true
    action = { type: actionTypes.ACCOUNT_SET_FETCHING_USER, fetchingUser }
    state = assertNewState(account, state, action)

    assert.isObject(state)
    assert.strictEqual(state.fetchingUser, fetchingUser)
  })

})
