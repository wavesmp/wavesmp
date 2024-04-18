const { ObjectID } = require('mongodb')

const { assertThrows, generateString } = require('waves-test-util')
const {
  TEST_TRACK1,
  TEST_TRACK2,
  TEST_PLAYLIST_NAME1
} = require('waves-test-data')

const {
  validateSelection,
  validateString,
  validateTrackIds,
  validateTrackUpdate,
  validateTracks,
  EDITABLE_TRACK_PROPS,
  MAX_STRING_LENGTH,
  MIN_STRING_LENGTH,
  MAX_DURATION,
  MIN_DURATION
} = require('../validators')

const TEST_TRACKS = [TEST_TRACK1, TEST_TRACK2]
const TEST_PROP = 'testProp'

const TEST_TYPES = {
  string: 'foo',
  int: 1,
  float: 1.2,
  obj: { foo: 'bar' },
  arr: ['arr'],
  bool: true,
  func: () => {
    throw new Error('unexpected Call')
  },
  null: null,
  undefined
}

const NOT_STRING_VALS = getTypeExcept('string')
const NOT_ARR_VALS = getTypeExcept('arr')
const NOT_OBJ_VALS = getTypeExcept('obj')
const NOT_NUM_VALS = getTypeExcept(['int', 'float'])

function getTypeExcept(excluded) {
  if (!Array.isArray(excluded)) {
    excluded = [excluded]
  }

  const types = { ...TEST_TYPES }

  for (const exclude of excluded) {
    delete types[exclude]
  }
  return Object.values(types)
}

module.exports = () => {
  describe('Validator methods', async () => {
    it('validate string types', async () => {
      for (const notStringVal of NOT_STRING_VALS) {
        await assertThrows(
          'validateString',
          validateString,
          [notStringVal, TEST_PROP],
          `Error: ${TEST_PROP} must be a string`
        )
      }
    })

    it('validate min string length', async () => {
      const shortString = generateString(MIN_STRING_LENGTH - 1)
      await assertThrows(
        'validateString',
        validateString,
        [shortString, TEST_PROP],
        `Error: ${TEST_PROP} length must be at least ${MIN_STRING_LENGTH}`
      )
    })

    it('validate max string length', async () => {
      const shortString = generateString(MAX_STRING_LENGTH + 1)
      await assertThrows(
        'validateString',
        validateString,
        [shortString, TEST_PROP],
        `Error: ${TEST_PROP} length must be at most ${MAX_STRING_LENGTH}`
      )
    })

    it('validate tracks type', async () => {
      for (const notArrVal of NOT_ARR_VALS) {
        await assertThrows(
          'validateTracks',
          validateTracks,
          [notArrVal],
          'Error: tracks must be an array'
        )
      }
    })

    it('validate track type', async () => {
      for (const notObjVal of NOT_OBJ_VALS) {
        await assertThrows(
          'validateTracks',
          validateTracks,
          [[notObjVal]],
          'Error: track must be an object'
        )
      }
    })

    it('validate track invalid properties', async () => {
      const track = { ...TEST_TRACK1, unknownProp: 'unknownVal' }
      await assertThrows(
        'validateTracks',
        validateTracks,
        [[track]],
        'Error: Invalid track prop unknownProp'
      )
    })

    it('Set track IDs', async () => {
      for (const track of TEST_TRACKS) {
        track.id = new ObjectID().toHexString()
      }
    })

    it('validate track required properties', async () => {
      const requiredStringProps = ['source']
      for (const prop of requiredStringProps) {
        for (const notStringVal of NOT_STRING_VALS) {
          const track = { ...TEST_TRACK1, [prop]: notStringVal }
          await assertThrows(
            'validateTracks',
            validateTracks,
            [[track]],
            `Error: ${prop} must be a string`
          )
        }
      }

      for (const notNumVal of NOT_NUM_VALS) {
        const track = { ...TEST_TRACK1, duration: notNumVal }
        await assertThrows(
          'validateTracks',
          validateTracks,
          [[track]],
          'Error: duration must be a number'
        )
      }

      for (const notNumVal of NOT_NUM_VALS) {
        const track = { ...TEST_TRACK1, duration: notNumVal }
        await assertThrows(
          'validateTracks',
          validateTracks,
          [[track]],
          'Error: duration must be a number'
        )
      }
      await assertThrows(
        'validateTracks',
        validateTracks,
        [[{ ...TEST_TRACK1, duration: MIN_DURATION - 1 }]],
        `Error: duration must be at least ${MIN_DURATION}`
      )

      await assertThrows(
        'validateTracks',
        validateTracks,
        [[{ ...TEST_TRACK1, duration: MAX_DURATION + 1 }]],
        `Error: duration must be at most ${MAX_DURATION}`
      )

      await assertThrows(
        'validateTracks',
        validateTracks,
        [[{ ...TEST_TRACK1, id: undefined }]],
        'Error: Invalid object ID'
      )
    })

    it('validate track optional properties', async () => {
      for (const prop of EDITABLE_TRACK_PROPS) {
        for (const notStringVal of NOT_STRING_VALS) {
          const track = { ...TEST_TRACK1, [prop]: notStringVal }
          await assertThrows(
            'validateTracks',
            validateTracks,
            [[track]],
            `Error: ${prop} must be a string`
          )
        }
      }
    })

    it('validate track update type', async () => {
      for (const notObjVal of NOT_OBJ_VALS) {
        await assertThrows(
          'validateTrackUpdate',
          validateTrackUpdate,
          [notObjVal],
          'Error: track update must be an object'
        )
      }
    })

    it('validate track update unknown prop', async () => {
      const update = { unknownProp: 'unknownVal' }
      await assertThrows(
        'validateTrackUpdate',
        validateTrackUpdate,
        [update],
        'Error: Invalid track update prop unknownProp'
      )
    })

    it('validate track ids type', async () => {
      for (const notArrVal of NOT_ARR_VALS) {
        await assertThrows(
          'validateTrackIds',
          validateTrackIds,
          [notArrVal],
          'Error: Track ids must be an array'
        )
      }
    })

    it('validate selection and entry type', async () => {
      for (const notArrVal of NOT_ARR_VALS) {
        await assertThrows(
          'validateSelection',
          validateSelection,
          [notArrVal],
          'Error: Selection must be an array'
        )
        await assertThrows(
          'validateSelection',
          validateSelection,
          [[notArrVal]],
          'Error: Selection entry must be an array'
        )
      }
    })

    it('validate selection entry length', async () => {
      await assertThrows(
        'validateSelection',
        validateSelection,
        [[[]]],
        'Error: Invalid selection entry length 0'
      )
      await assertThrows(
        'validateSelection',
        validateSelection,
        [[[0]]],
        'Error: Invalid selection entry length 1'
      )
      await assertThrows(
        'validateSelection',
        validateSelection,
        [[[0, 'id0', 'extra']]],
        'Error: Invalid selection entry length 3'
      )
    })

    it('validate selection duplicates', async () => {
      const selection = [
        [0, '0'],
        [0, '0']
      ]
      const tracks = ['0', '1']
      const name = TEST_PLAYLIST_NAME1
      await assertThrows(
        'validateSelection',
        validateSelection,
        [selection, tracks, name],
        'Error: Duplicate index 0 in selection'
      )
    })

    it('validate selection entry out of bounds', async () => {
      const lowSelection = [[-1, '0']]
      const highSelection = [[2, '1']]
      const tracks = [0, 1]
      const name = TEST_PLAYLIST_NAME1
      await assertThrows(
        'validateSelection',
        validateSelection,
        [lowSelection, tracks, name],
        `Error: Selection index -1 out of bounds for playlist ${name}`
      )
      await assertThrows(
        'validateSelection',
        validateSelection,
        [highSelection, tracks, name],
        `Error: Selection index 2 out of bounds for playlist ${name}`
      )
    })

    it('validate selection entry out of bounds', async () => {
      const selection = [[0, '1']]
      const tracks = ['0', '1']
      const name = TEST_PLAYLIST_NAME1
      await assertThrows(
        'validateSelection',
        validateSelection,
        [selection, tracks, name],
        `Error: Selection index mismatch 0 for playlist ${name}`
      )
    })
  })
}
