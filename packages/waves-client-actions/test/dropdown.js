const { assert } = require('chai')

const types = require('waves-action-types')
const { TEST_DROPDOWN: testDropdown } = require('waves-test-data')

const actions = require('../src/dropdown')

describe('#dropdown()', () => {
  it('#dropdownSet()', () => {
    assert.isDefined(types.DROPDOWN_SET)
    const expectedAction = { type: types.DROPDOWN_SET, dropdown: testDropdown }
    assert.deepEqual(actions.dropdownSet(testDropdown), expectedAction)
  })
})
