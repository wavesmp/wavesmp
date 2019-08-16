const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../src/menubar')

describe('#menubar()', () => {
  it('#menubarSet()', () => {
    const menubar = true
    assert.isDefined(types.MENUBAR_SET)
    const expectedAction = { type: types.MENUBAR_SET, menubar }
    assert.deepEqual(actions.menubarModeSet(menubar), expectedAction)
  })
})
