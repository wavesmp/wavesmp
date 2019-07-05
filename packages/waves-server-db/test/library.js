const { assert } = require('chai')
const zip = require('lodash.zip')
const { ObjectID } = require('mongodb')

const { assertThrows, assertThrowsMessage } = require('waves-test-util')
const {
  TEST_USER1,
  TEST_USER2,
  TEST_TRACK1,
  TEST_TRACK2,
  TEST_TRACK1_UPDATE,
  TEST_TRACK2_UPDATE
} = require('waves-test-data')

const TEST_USERS = [TEST_USER1, TEST_USER2]
const TEST_TRACKS = [TEST_TRACK1, TEST_TRACK2]
const TEST_TRACK_UPDATES = [TEST_TRACK1_UPDATE, TEST_TRACK2_UPDATE]

module.exports = getStorage => {
  describe('Library methods', async () => {
    it('Library initially empty for users', async () => {
      await testLibrariesEmpty(getStorage)
    })

    it('Set track IDs', async () => {
      for (const track of TEST_TRACKS) {
        track.id = new ObjectID().toHexString()
      }
    })

    it('Add user tracks', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS)
      for (const [user, track] of combined) {
        await getStorage().addTracks(user, [{ ...track }])
      }
    })

    it('Users see only their respective tracks', async () => {
      await testUserLibraryTracks(getStorage)
    })

    it('Track ids are unique', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const msg =
        `E11000 duplicate key error collection: ` +
        `waves.track index: _id_ dup key: ` +
        `{ : ObjectId('${track.id}') }`

      await assertThrowsMessage(
        'addTrack',
        getStorage().addTracks,
        [user, [{ ...track }]],
        msg,
        getStorage()
      )
    })

    it('Cannot update unknown track id', async () => {
      const user = TEST_USER1
      const unknownId = new ObjectID()
      const msg = `Error: Cannot update unknown track: ${unknownId}`
      await assertThrows(
        'updateTrack',
        getStorage().updateTrack,
        [user, unknownId, { artist: 'failedUpdate' }],
        msg,
        getStorage()
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

    it('Delete track ids must be valid object ids', async () => {
      const user = TEST_USER1
      const track = 'invalid'
      const msg =
        'Error: Argument passed in must be a single String of ' +
        '12 bytes or a string of 24 hex characters'
      await assertThrows(
        'deleteTracks',
        getStorage().deleteTracks,
        [user, [track]],
        msg,
        getStorage()
      )
    })

    it('Track delete failures do not affect db', async () => {
      await testUserLibraryTracks(getStorage)
    })

    it('Delete tracks', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS)
      for (const [testUser, testTrack] of combined) {
        await getStorage().deleteTracks(testUser, [testTrack.id])
      }
    })

    it('Library empty for users after delete', async () => {
      await testLibrariesEmpty(getStorage)
    })

    it('Add user tracks', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS)
      for (const [user, track] of combined) {
        await getStorage().addTracks(user, [{ ...track }])
      }
    })

    it('Users again see only their respective tracks', async () => {
      await testUserLibraryTracks(getStorage)
    })
  })
}

async function testLibrariesEmpty(getStorage) {
  for (const user of TEST_USERS) {
    const library = await getStorage().getLibrary(user)
    assert.isArray(library)
    assert.isEmpty(library)
  }
}

async function testUserLibraryTracks(getStorage) {
  for (const [user, testTrack] of zip(TEST_USERS, TEST_TRACKS)) {
    const library = await getStorage().getLibrary(user)
    assert.strictEqual(library.length, 1)
    assert.isArray(library)

    const track = library[0]
    assert.deepEqual(track, testTrack)
  }
}
