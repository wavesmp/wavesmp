const { assert } = require('chai')
const mongoid = require('mongoid-js')

const actionTypes = require('waves-action-types')
const {
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2,
  TEST_TRACK1_UPDATE: update1
} = require('waves-test-data')
const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')

const uploads = require('../../src/tracks/uploads')

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }
const update = [track1, track2]
const updateLib = {
  [track1.id]: track1,
  [track2.id]: track2
}

describe('#uploads()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(uploads, undefined, UNKNOWN_ACTION)
    assert.isNull(state)
  })

  it('track uploads update', () => {
    assert.isDefined(actionTypes.TRACK_UPLOADS_UPDATE)
    const action = { type: actionTypes.TRACK_UPLOADS_UPDATE, update }
    state = assertNewState(uploads, state, action)
    assert.deepEqual(state, updateLib)
  })

  it('upload track update', () => {
    assert.isDefined(actionTypes.UPLOAD_TRACKS_UPDATE)
    const key = 'title'
    action = {
      type: actionTypes.UPLOAD_TRACKS_UPDATE,
      ids: [track1.id],
      key,
      value: update1[key]
    }
    state = assertNewState(uploads, state, action)
    const expectedState = {
      ...updateLib,
      [track1.id]: {
        ...track1,
        [key]: update1[key]
      }
    }
    assert.deepEqual(state, expectedState)
  })
})
