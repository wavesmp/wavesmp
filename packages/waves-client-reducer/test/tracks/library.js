const { assert } = require('chai')
const mongoid = require('mongoid-js')

const actionTypes = require('waves-action-types')

const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')
const {
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2,
  TEST_TRACK1_UPDATE: update1
} = require('waves-test-data')

const library = require('../../src/tracks/library')

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }

const libraryById = {
  [track1.id]: track1,
  [track2.id]: track2
}

describe('#library()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(library, undefined, UNKNOWN_ACTION)
    assert.isNull(state)
  })

  it('library update', () => {
    action = { type: actionTypes.TRACKS_UPDATE, libraryById }
    state = assertNewState(library, state, action)
    assert.strictEqual(state, libraryById)
  })

  it('library delete', () => {
    action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track2.id])
    }
    state = assertNewState(library, state, action)
    assert.deepEqual(state, { [track1.id]: track1 })
  })

  it('library track update', () => {
    const key = 'title'
    action = {
      type: actionTypes.LIBRARY_TRACK_UPDATE,
      ids: [track1.id],
      key,
      value: update1[key]
    }
    state = assertNewState(library, state, action)
    assert.deepEqual(state, { [track1.id]: { ...track1, [key]: update1[key] } })
  })
})
