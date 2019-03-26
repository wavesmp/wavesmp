const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../src/sidebar')

describe('#sidebar()', () => {
  it('#sidebarSet()', () => {
    const mode = 'testMode'
    assert.isDefined(types.SIDEBAR_MODE_SET)
    const expectedAction = { type: types.SIDEBAR_MODE_SET, mode }
    assert.deepEqual(actions.sidebarModeSet(mode), expectedAction)
  })
})
