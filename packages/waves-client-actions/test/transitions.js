const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../src/transitions')

describe('#transitions()', () => {

  it('#transitionMainSet()', () => {
    assert.isDefined(types.TRANSITION_MAIN_SET)
    const on = false
    const expectedAction = { type: types.TRANSITION_MAIN_SET, on }
    assert.deepEqual(actions.transitionMainSet(on), expectedAction)
  })

})
