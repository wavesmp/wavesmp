const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../../src/tracks/uploads')

describe('#uploads()', () => {

  it('#uploadInfoUpdate()', () => {
    const id = 'testId'
    const key = 'testAttr'
    const value = 'testUpdate'
    assert.isDefined(types.UPLOAD_TRACKS_UPDATE)
    const expectedAction = { type: types.UPLOAD_TRACKS_UPDATE, ids: [id], key, value }
    assert.deepEqual(actions.uploadInfoUpdate(id, key, value), expectedAction)
  })

})
