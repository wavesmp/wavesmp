const { assert } = require('chai')
const Promise = require('bluebird')
const mongoid = require('mongoid-js')
const sinon = require('sinon')
const WebSocket = require('ws')

const types = require('waves-action-types')
const {
  TEST_PLAYLIST_NAME1,
  TEST_PLAYLIST_NAME2,
  TEST_TRACK_ID,
  TEST_TRACK1,
  TEST_USER1
} = require('waves-test-data')
const { assertThrows } = require('waves-test-util')
const Auth = require('waves-server-auth')
const Storage = require('waves-server-db')
const log = require('waves-server-logger')
const WavesSocket = require('waves-socket')

const WavesServer = require('../src/wavesServer')

const TEST_LIBRARY = [TEST_TRACK1]

const TEST_PLAYLIST1 = {
  name: TEST_PLAYLIST_NAME1,
  tracks: [TEST_TRACK_ID]
}
const TEST_PLAYLISTS = [TEST_PLAYLIST1]

const TEST_USER_TOKEN = 'testUserToken'
const TEST_PORT = 16243

const BEST_EFFORT_MESSAGE_TIMEOUT =
  /* Remove app logging since it clutters test output */
  // log.remove(log.transports.Console)

  describe('wavesServer', () => {
    const auth = new Auth({})
    const storage = new Storage()
    const wavesServer = new WavesServer(TEST_PORT, storage, auth)
    let wavesSocket

    describe('wavesServer', async () => {
      it('Start server', async () => {
        const storageMock = sinon.mock(storage)
        const storageExpect = storageMock
          .expects('connect')
          .once()
          .withArgs()

        await wavesServer.start()

        storageMock.verify()
      })

      it('Start client', async () => {
        const url = `ws://localhost:${TEST_PORT}`
        wavesSocket = new WavesSocket(() => new WebSocket(url))
      })

      it('Login fail', async () => {
        await assertThrows(
          'sendAckedMessage',
          wavesSocket.sendAckedMessage,
          [
            types.ACCOUNT_LOGIN,
            { token: TEST_USER_TOKEN, idp: TEST_USER1.idp }
          ],
          `Error: Error: Invalid identity provider: ${TEST_USER1.idp}`,
          wavesSocket
        )
      })

      it('Login', async () => {
        // Mock auth response
        const authMock = sinon.mock(auth)
        const authExpect = authMock
          .expects('login')
          .once()
          .withArgs(TEST_USER1.idp, TEST_USER_TOKEN)
          .returns(TEST_USER1)

        // Mock db calls
        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('getUser')
          .once()
          .withArgs(
            TEST_USER1.idp,
            TEST_USER1.idpId,
            TEST_USER1.email,
            TEST_USER1.name
          )
          .returns(TEST_USER1)

        const storageLibraryExpect = storageMock
          .expects('getLibrary')
          .once()
          .returns(TEST_LIBRARY)
        const storagePlaylistsExpect = storageMock
          .expects('getPlaylists')
          .once()
          .returns(TEST_PLAYLISTS)

        const libraryReceivedPromise = new Promise((resolve, reject) => {
          wavesSocket.setOnLibraryUpdate(lib => {
            try {
              assert.deepEqual(lib, TEST_LIBRARY)
              resolve()
            } catch (err) {
              reject(err)
            }
          })
        })

        const playlistsReceivedPromise = new Promise((resolve, reject) => {
          wavesSocket.setOnPlaylistsUpdate(playlists => {
            try {
              assert.deepEqual(playlists, TEST_PLAYLISTS)
              resolve()
            } catch (err) {
              reject(err)
            }
          })
        })

        const user = await wavesSocket.sendAckedMessage(types.ACCOUNT_LOGIN, {
          token: TEST_USER_TOKEN,
          idp: TEST_USER1.idp
        })
        assert.deepEqual(user, TEST_USER1)

        authMock.verify()
        storageMock.verify()

        await Promise.all([libraryReceivedPromise, playlistsReceivedPromise])
      })

      it('playlist add error', async () => {
        const playlistName = ''
        const trackIds = []
        const user = TEST_USER1

        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('playlistAdd')
          .once()
          .throws('blank playlistName')

        const data = { playlistName, trackIds }
        await assertThrows(
          'sendAckedMessage',
          wavesSocket.sendAckedMessage,
          [types.PLAYLIST_ADD, data],
          'Error: blank playlistName',
          wavesSocket
        )
        storageMock.verify()
      })

      it('playlist add', async () => {
        const playlistName = TEST_PLAYLIST_NAME1
        const trackIds = [mongoid()]
        const user = TEST_USER1

        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('playlistAdd')
          .once()
          .withArgs(user, playlistName, trackIds)

        const data = { playlistName, trackIds }
        await wavesSocket.sendAckedMessage(types.PLAYLIST_ADD, data)
        storageMock.verify()
      })

      it('tracks remove', async () => {
        const user = TEST_USER1
        const playlistName = TEST_PLAYLIST_NAME1
        const deleteIndexes = [3, 2, 1]

        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('tracksRemove')
          .once()
          .withArgs(user, playlistName, deleteIndexes)

        const data = { playlistName, deleteIndexes }
        await wavesSocket.sendAckedMessage(types.TRACKS_REMOVE, data)
        storageMock.verify()
      })

      it('playlist copy', async () => {
        const user = TEST_USER1
        const src = TEST_PLAYLIST_NAME1
        const dest = TEST_PLAYLIST_NAME2

        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('playlistCopy')
          .once()
          .withArgs(user, src, dest)

        const data = { src, dest }
        await wavesSocket.sendAckedMessage(types.PLAYLIST_COPY, data)
        storageMock.verify()
      })

      it('playlist move', async () => {
        const user = TEST_USER1
        const src = TEST_PLAYLIST_NAME1
        const dest = TEST_PLAYLIST_NAME2

        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('playlistMove')
          .once()
          .withArgs(user, src, dest)

        const data = { src, dest }
        await wavesSocket.sendAckedMessage(types.PLAYLIST_MOVE, data)
        storageMock.verify()
      })

      it('playlist delete', async () => {
        const user = TEST_USER1
        const playlistName = TEST_PLAYLIST_NAME1

        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('deletePlaylist')
          .once()
          .withArgs(user, playlistName)

        const data = { playlistName }
        await wavesSocket.sendAckedMessage(types.PLAYLIST_DELETE, data)
        storageMock.verify()
      })

      it('library track update', async () => {
        const user = TEST_USER1
        const id = TEST_TRACK_ID
        const key = 'testKey'
        const value = 'testValue'

        const expectedUpdate = {
          [key]: value,
          idp: user.idp,
          idpId: user.idpId
        }
        const storageMock = sinon.mock(storage)
        const storageUserExpect = storageMock
          .expects('updateTrack')
          .once()
          .withArgs(user, id, expectedUpdate)

        const data = { id, key, value }
        await wavesSocket.sendAckedMessage(types.LIBRARY_TRACK_UPDATE, data)
        storageMock.verify()
      })

      it('Close server', async () => {
        await wavesServer.close()
        wavesSocket.close()
      })
    })
  })
