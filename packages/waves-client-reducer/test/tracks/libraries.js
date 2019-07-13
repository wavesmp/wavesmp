const { assert } = require('chai')
const mongoid = require('mongoid-js')

const actionTypes = require('waves-action-types')
const {
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2,
  TEST_TRACK1_UPDATE: update1
} = require('waves-test-data')
const { assertNewState, UNKNOWN_ACTION } = require('waves-test-util')

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }
const libType = 'testLibType'
const updateKey = 'title'
const testLib = {
  [track1.id]: track1,
  [track2.id]: track2
}

const libraries = require('../../src/tracks/libraries')

describe('#libraries()', () => {
  let state
  let action

  it('initial state', () => {
    state = assertNewState(libraries, undefined, UNKNOWN_ACTION)
    assert.isObject(state)
    assert.isEmpty(state)
  })

  it('tracks add', () => {
    assert.isDefined(actionTypes.TRACKS_ADD)
    action = { type: actionTypes.TRACKS_ADD, lib: testLib, libType }
    state = assertNewState(libraries, state, action)
    assert.deepEqual(state, { [libType]: testLib })
  })

  it('libraries track update', () => {
    assert.isDefined(actionTypes.TRACKS_INFO_UPDATE)
    action = {
      type: actionTypes.TRACKS_INFO_UPDATE,
      ids: [track1.id],
      key: updateKey,
      value: update1[updateKey],
      libType
    }
    state = assertNewState(libraries, state, action)
    const expectedState = {
      [libType]: {
        ...testLib,
        [track1.id]: {
          ...track1,
          [updateKey]: update1[updateKey]
        }
      }
    }
    assert.deepEqual(state, expectedState)
  })

  it('libraries delete', () => {
    action = {
      type: actionTypes.TRACKS_DELETE,
      deleteIds: new Set([track2.id]),
      libType
    }
    state = assertNewState(libraries, state, action)
    const expectedState = {
      [libType]: {
        [track1.id]: {
          ...track1,
          [updateKey]: update1[updateKey]
        }
      }
    }
    assert.deepEqual(state, expectedState)
  })
})
