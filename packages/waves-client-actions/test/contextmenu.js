const { assert } = require('chai')

const types = require('waves-action-types')
const { TEST_CONTEXTMENU1: menu } = require('waves-test-data')

const actions = require('../src/contextmenu')

describe('#contextmenu()', () => {
  it('#contextmenuReset()', () => {
    assert.isDefined(types.CONTEXTMENU_RESET)
    const expectedAction = { type: types.CONTEXTMENU_RESET }
    assert.deepEqual(actions.contextmenuReset(), expectedAction)
  })

  it('#contextmenuSet()', () => {
    assert.isDefined(types.CONTEXTMENU_SET)
    const expectedAction = { type: types.CONTEXTMENU_SET, menu }
    assert.deepEqual(actions.contextmenuSet(menu), expectedAction)
  })

  it('#contextmenuNext()', () => {
    assert.isDefined(types.CONTEXTMENU_NEXT)
    const expectedAction = { type: types.CONTEXTMENU_NEXT, menu }
    assert.deepEqual(actions.contextmenuNext(menu), expectedAction)
  })

  it('#contextmenuBack()', () => {
    assert.isDefined(types.CONTEXTMENU_BACK)
    const expectedAction = { type: types.CONTEXTMENU_BACK }
    assert.deepEqual(actions.contextmenuBack(), expectedAction)
  })
})
