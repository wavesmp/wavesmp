const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../src/sidebar')

describe('#sidebar()', () => {
  it('#sidebarSet()', () => {
    const sidebar = true
    assert.isDefined(types.SIDEBAR_MODE_SET)
    const expectedAction = { type: types.SIDEBAR_MODE_SET, sidebar }
    assert.deepEqual(actions.sidebarModeSet(sidebar), expectedAction)
  })
})
