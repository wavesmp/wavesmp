const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../../src/tracks/uploads')

describe('#uploads()', () => {

  it('#uploadInfoUpdate()', () => {
    const id = 'testId'
    const attr = 'testAttr'
    const update = 'testUpdate'
    assert.isDefined(types.UPLOAD_TRACK_UPDATE)
    const expectedAction = { type: types.UPLOAD_TRACK_UPDATE, id, attr, update }
    assert.deepEqual(actions.uploadInfoUpdate(id, attr, update), expectedAction)
  })

})
