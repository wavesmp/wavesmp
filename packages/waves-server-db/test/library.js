const { assert } = require('chai')
const mongoose = require('mongoose')
const zip = require('lodash.zip')

const {
  assertThrows,
  assertThrowsMessage,
  generateString
} = require('waves-test-util')
const {
  TEST_USER1,
  TEST_USER2,
  TEST_TRACK1,
  TEST_TRACK2,
  TEST_TRACK1_UPDATE,
  TEST_TRACK2_UPDATE
} = require('waves-test-data')

const { MAX_DURATION, MAX_STRING_LENGTH, MIN_DURATION } = require('../models')

const TEST_USERS = [TEST_USER1, TEST_USER2]
const TEST_TRACKS = [TEST_TRACK1, TEST_TRACK2]
const TEST_TRACK_UPDATES = [TEST_TRACK1_UPDATE, TEST_TRACK2_UPDATE]
const TRACK_REQUIRED_ATTRS = ['source', 'duration', 'idp', 'idpId']
const DURATION_FIELD = 'duration'

module.exports = getStorage => {
  describe('Library methods', async () => {
    it('Library initially empty for users', async () => {
      await testLibrariesEmpty(getStorage)
    })

    it('Tracks have required fields', async () => {
      const track = TEST_TRACK1
      for (const requiredAttr of TRACK_REQUIRED_ATTRS) {
        const msg =
          `ValidationError: ${requiredAttr}: ` +
          `track ${requiredAttr} is required`

        for (const emptyVal of [null, undefined, '']) {
          await testTrackCreateInvalidValue(
            getStorage,
            track,
            requiredAttr,
            emptyVal,
            msg
          )
        }
        await testTrackCreateMissingValue(getStorage, track, requiredAttr, msg)
      }
    })

    it('Tracks have max length fields', async () => {
      const track = TEST_TRACK1
      for (const attr in track) {
        if (attr === DURATION_FIELD) {
          continue
        }
        const overValue = generateString(MAX_STRING_LENGTH + 1)

        const msg =
          `ValidationError: ${attr}: ` +
          `Path \`${attr}\` (\`${overValue}\`) ` +
          `is longer than the maximum allowed ` +
          `length (${MAX_STRING_LENGTH}).`

        await testTrackCreateInvalidValue(
          getStorage,
          track,
          attr,
          overValue,
          msg
        )
      }
    })

    it('Tracks cannot have unknown properties', async () => {
      const track = TEST_TRACK1
      const key = 'unknownKey'
      const val = 'unknownVal'

      const msg =
        `StrictModeError: Field \`${key}\` is not ` +
        `in schema and strict mode is set to throw.`

      await testTrackCreateInvalidValue(getStorage, track, key, val, msg)
    })

    it('Tracks have min duration', async () => {
      const track = TEST_TRACK1
      const underValue = MIN_DURATION - 1

      const underMsg =
        `ValidationError: ${DURATION_FIELD}: ` +
        `Path \`${DURATION_FIELD}\` ` +
        `(${underValue}) is less than minimum ` +
        `allowed value (${MIN_DURATION}).`

      await testTrackCreateInvalidValue(
        getStorage,
        track,
        DURATION_FIELD,
        underValue,
        underMsg
      )
    })

    it('Tracks have max duration', async () => {
      const track = TEST_TRACK1
      const overValue = MAX_DURATION + 1

      const overMsg =
        `ValidationError: ${DURATION_FIELD}: ` +
        `Path \`${DURATION_FIELD}\` ` +
        `(${overValue}) is more than maximum ` +
        `allowed value (${MAX_DURATION}).`

      await testTrackCreateInvalidValue(
        getStorage,
        track,
        DURATION_FIELD,
        overValue,
        overMsg
      )
    })

    it('Track duration is not a string', async () => {
      const track = TEST_TRACK1
      const duration = 'invalidDuration'

      const msg =
        `ValidationError: ${DURATION_FIELD}: ` +
        `Cast to Number failed for value "${duration}" ` +
        `at path "${DURATION_FIELD}"`

      await testTrackCreateInvalidValue(
        getStorage,
        track,
        DURATION_FIELD,
        duration,
        msg
      )
    })

    it('Track requires id', async () => {
      const track = TEST_TRACK1
      await assertThrows(
        'addTrack',
        getStorage().addTrack,
        [track],
        'MongooseError: document must have an _id before saving'
      )
    })

    it('Failed track create does not affect library', async () => {
      await testLibrariesEmpty(getStorage)
    })

    it('Add user tracks', async () => {
      for (const track of TEST_TRACKS) {
        track.id = mongoose.Types.ObjectId().toString()
        await getStorage().addTrack(track)
      }
    })

    it('Users see only their respective tracks', async () => {
      await testUserLibraryTracks(getStorage)
    })

    it('Track ids are unique', async () => {
      const track = TEST_TRACK1
      const msg =
        `E11000 duplicate key error collection: ` +
        `waves.track index: _id_ dup key: ` +
        `{ : ObjectId('${track.id}') }`

      await assertThrowsMessage('addTrack', getStorage().addTrack, [track], msg)
    })

    it('Cannot update unknown track id', async () => {
      const user = TEST_USER1
      const unknownId = mongoose.Types.ObjectId()
      const msg = `Error: Cannot update track. Unknown id: ${unknownId}`
      await assertThrows(
        'updateTrack',
        getStorage().updateTrack,
        [user, unknownId, { [DURATION_FIELD]: 900 }],
        msg
      )
    })

    /* _id is not exposed to users, but it's in the mongoose schema */
    it('Cannot update track _id', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const newId = mongoose.Types.ObjectId()
      const msg =
        "MongoError: Performing an update on the path '_id' " +
        "would modify the immutable field '_id'"

      await assertThrows(
        'updateTrack',
        getStorage().updateTrack,
        [user, track.id, { _id: newId }],
        msg
      )
    })

    it('Cannot update track id or unknown values', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const keyVals = [
        ['id', mongoose.Types.ObjectId()],
        ['unknownKey', 'unknownVal']
      ]

      for (const [key, val] of keyVals) {
        const msg =
          `StrictModeError: Field \`${key}\` is not in ` +
          `schema and strict mode is set to throw.`

        await assertThrows(
          'updateTrack',
          getStorage().updateTrack,
          [user, track.id, { [key]: val }],
          msg
        )
      }
    })

    it('Updated tracks have max length fields', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      for (const attr in track) {
        if (attr === DURATION_FIELD || attr === 'id') {
          continue
        }
        const overValue = generateString(MAX_STRING_LENGTH + 1)

        const msg =
          `ValidationError: ${attr}: ` +
          `Path \`${attr}\` (\`${overValue}\`) ` +
          `is longer than the maximum allowed ` +
          `length (${MAX_STRING_LENGTH}).`

        await assertThrows(
          'updateTrack',
          getStorage().updateTrack,
          [user, track.id, { [attr]: overValue }],
          msg
        )
      }
    })

    it('Updated tracks have min duration', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const underValue = MIN_DURATION - 1

      const msg =
        `ValidationError: ${DURATION_FIELD}: ` +
        `Path \`${DURATION_FIELD}\` ` +
        `(${underValue}) is less than minimum ` +
        `allowed value (${MIN_DURATION}).`

      await assertThrows(
        'updateTrack',
        getStorage().updateTrack,
        [user, track.id, { [DURATION_FIELD]: underValue }],
        msg
      )
    })

    it('Updated tracks have max duration', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const overValue = MAX_DURATION + 1

      const msg =
        `ValidationError: ${DURATION_FIELD}: ` +
        `Path \`${DURATION_FIELD}\` ` +
        `(${overValue}) is more than maximum ` +
        `allowed value (${MAX_DURATION}).`

      await assertThrows(
        'updateTrack',
        getStorage().updateTrack,
        [user, track.id, { [DURATION_FIELD]: overValue }],
        msg
      )
    })

    it('Updated track duration is not a string', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const duration = 'invalidDuration'

      const msg =
        `CastError: Cast to number failed for ` +
        `value "${duration}" at path "${DURATION_FIELD}"`

      await assertThrows(
        'updateTrack',
        getStorage().updateTrack,
        [user, track.id, { [DURATION_FIELD]: duration }],
        msg
      )
    })

    it('Failed update attempts do not affect db', async () => {
      await testUserLibraryTracks(getStorage)
    })

    it('Update tracks', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_TRACK_UPDATES)
      for (const [testUser, testTrack, testTrackUpdate] of combined) {
        Object.assign(testTrack, testTrackUpdate)
        await getStorage().updateTrack(testUser, testTrack.id, testTrackUpdate)
      }
    })

    it('Tracks are updated in db library', async () => {
      await testUserLibraryTracks(getStorage)
    })
  })
}

async function testTrackCreateMissingValue(getStorage, track, key, msg) {
  const trackCopy = { ...track }
  delete trackCopy[key]
  await assertThrows('addTrack', getStorage().addTrack, [trackCopy], msg)
}

async function testTrackCreateInvalidValue(getStorage, track, key, val, msg) {
  const trackCopy = { ...track }
  trackCopy[key] = val
  await assertThrows('addTrack', getStorage().addTrack, [trackCopy], msg)
}

async function testLibrariesEmpty(getStorage) {
  for (const user of TEST_USERS) {
    const library = await getStorage().getLibrary(user)
    assert.isEmpty(library, `Library not empty for user ${user.name}`)
    assert.typeOf(library, 'array')
  }
}

async function testUserLibraryTracks(getStorage) {
  for (const [user, testTrack] of zip(TEST_USERS, TEST_TRACKS)) {
    const library = await getStorage().getLibrary(user)
    assert.strictEqual(library.length, 1)
    assert.typeOf(library, 'array')

    const track = library[0]
    for (const attr in testTrack) {
      assert.strictEqual(track[attr], testTrack[attr])
    }
    assert.strictEqual(Object.keys(track).length, Object.keys(testTrack).length)
  }
}
