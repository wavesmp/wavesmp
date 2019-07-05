const { assert } = require('chai')
const zip = require('lodash.zip')

const { assertThrows, generateString } = require('waves-test-util')
const {
  TEST_USER1,
  TEST_USER2,
  TEST_TRACK1,
  TEST_TRACK2,
  TEST_PLAYLIST_NAME1,
  TEST_PLAYLIST_NAME2,
  TEST_PLAYLIST_COPY_NAME1,
  TEST_PLAYLIST_COPY_NAME2,
  TEST_PLAYLIST_MOVE_NAME1,
  TEST_PLAYLIST_MOVE_NAME2,
  TEST_TRACK_ID
} = require('waves-test-data')

const TEST_USERS = [TEST_USER1, TEST_USER2]
const TEST_TRACKS = [TEST_TRACK1, TEST_TRACK2]
const TEST_PLAYLIST_NAMES = [TEST_PLAYLIST_NAME1, TEST_PLAYLIST_NAME2]
const TEST_PLAYLIST_COPY_NAMES = [
  TEST_PLAYLIST_COPY_NAME1,
  TEST_PLAYLIST_COPY_NAME2
]
const TEST_PLAYLIST_MOVE_NAMES = [
  TEST_PLAYLIST_MOVE_NAME1,
  TEST_PLAYLIST_MOVE_NAME2
]

module.exports = getStorage => {
  describe('Playlist methods', async () => {
    it('Playlists initially empty for users', async () => {
      for (const user of TEST_USERS) {
        const playlists = await getStorage().getPlaylists(user)
        assert.isArray(playlists)
        assert.isEmpty(playlists)
      }
    })

    it('Initial playlist tracks for users', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const tracks = [track.id]
        const updatedTracks = await getStorage().playlistAdd(
          user,
          playlistName,
          tracks
        )
        assert.deepEqual(updatedTracks, tracks)
      }
    })

    it('Playlist add is visible in user playlists', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistName,
            tracks: [track.id]
          }
        ])
      }
    })

    it('Add to existing playlist for users', async () => {
      const combined = zip(TEST_USERS, TEST_PLAYLIST_NAMES)
      for (const [user, playlistName] of combined) {
        await getStorage().playlistAdd(user, playlistName, [TEST_TRACK_ID])
      }
    })

    it('Playlist second add is visible in user playlists', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistName,
            tracks: [track.id, TEST_TRACK_ID]
          }
        ])
      }
    })

    it('Cannot remove from unknown playlist', async () => {
      const user = TEST_USER1
      const playlistName = 'unknownPlaylist'
      const removals = [[0, TEST_TRACK1.id]]
      const msg = `Error: Cannot remove from unknown playlist: ${playlistName}`
      await assertThrows(
        'tracksRemove',
        getStorage().tracksRemove,
        [user, playlistName, removals],
        msg,
        getStorage()
      )
    })

    it('Failed removal does not modify db', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistName,
            tracks: [track.id, TEST_TRACK_ID]
          }
        ])
      }
    })

    it('Remove second playlist track', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, testTrack, playlistName] of combined) {
        const updated = await getStorage().tracksRemove(user, playlistName, [
          [1, TEST_TRACK_ID]
        ])
        assert.deepEqual(updated, [testTrack.id])
      }
    })

    it('Removal is reflected in db', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistName,
            tracks: [track.id]
          }
        ])
      }
    })

    it('Cannot copy from unknown playlist', async () => {
      const user = TEST_USER1
      const playlistName = 'unknownPlaylist'
      const destPlaylistName = TEST_PLAYLIST_COPY_NAME1
      const msg = `Error: Cannot copy unknown playlist: ${playlistName}`
      await assertThrows(
        'playlistCopy',
        getStorage().playlistCopy,
        [user, playlistName, destPlaylistName],
        msg,
        getStorage()
      )
    })

    it('Cannot copy to existing playlist', async () => {
      const user = TEST_USER1
      const playlistName = TEST_PLAYLIST_NAME1
      const destPlaylistName = TEST_PLAYLIST_NAME1
      const msg =
        'MongoError: E11000 duplicate key error collection: ' +
        'waves.playlist index: idp_1_idpId_1_name_1 dup key: ' +
        `{ : "${user.idp}", : "${user.idpId}", : "${playlistName}" }`
      await assertThrows(
        'playlistCopy',
        getStorage().playlistCopy,
        [user, playlistName, destPlaylistName],
        msg,
        getStorage()
      )
    })

    it('Failed copy attempts do not affect db', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistName,
            tracks: [track.id]
          }
        ])
      }
    })

    it('Copy playlists', async () => {
      const combined = zip(
        TEST_USERS,
        TEST_PLAYLIST_NAMES,
        TEST_PLAYLIST_COPY_NAMES
      )
      for (const [user, playlistName, destPlaylistName] of combined) {
        await getStorage().playlistCopy(user, playlistName, destPlaylistName)
      }
    })

    it('Playlists are copied in DB', async () => {
      const combined = zip(
        TEST_USERS,
        TEST_TRACKS,
        TEST_PLAYLIST_NAMES,
        TEST_PLAYLIST_COPY_NAMES
      )
      for (const [user, track, playlistName, copyPlaylistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: copyPlaylistName,
            tracks: [track.id]
          },
          {
            name: playlistName,
            tracks: [track.id]
          }
        ])
      }
    })

    it('Cannot move unknown playlist', async () => {
      const user = TEST_USER1
      const playlist = 'unknownPlaylistName'
      const destPlaylist = 'unknownPlaylistName2'
      const msg = `Error: Cannot move unknown playlist ${playlist}`

      await assertThrows(
        'playlistMove',
        getStorage().playlistMove,
        [user, playlist, destPlaylist],
        msg,
        getStorage()
      )
    })

    it('Cannot move to existing playlist', async () => {
      const user = TEST_USER1
      const playlist = TEST_PLAYLIST_COPY_NAME1
      const destPlaylist = TEST_PLAYLIST_NAME1
      const msg =
        'MongoError: E11000 duplicate key error collection: ' +
        'waves.playlist index: idp_1_idpId_1_name_1 dup key: ' +
        `{ : "${user.idp}", : "${user.idpId}", : "${destPlaylist}" }`

      await assertThrows(
        'playlistMove',
        getStorage().playlistMove,
        [user, playlist, destPlaylist],
        msg,
        getStorage()
      )
    })

    it('Failed move attempts are not reflected in db', async () => {
      const combined = zip(
        TEST_USERS,
        TEST_TRACKS,
        TEST_PLAYLIST_NAMES,
        TEST_PLAYLIST_COPY_NAMES
      )
      for (const [user, track, playlistName, copyPlaylistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: copyPlaylistName,
            tracks: [track.id]
          },
          {
            name: playlistName,
            tracks: [track.id]
          }
        ])
      }
    })

    it('Move playlists', async () => {
      const combined = zip(
        TEST_USERS,
        TEST_PLAYLIST_COPY_NAMES,
        TEST_PLAYLIST_MOVE_NAMES
      )
      for (const [user, playlistName, destPlaylistName] of combined) {
        await getStorage().playlistMove(user, playlistName, destPlaylistName)
      }
    })

    it('Playlists are moved in db', async () => {
      const combined = zip(
        TEST_USERS,
        TEST_TRACKS,
        TEST_PLAYLIST_NAMES,
        TEST_PLAYLIST_MOVE_NAMES
      )
      for (const [user, track, playlistName, playlistMoveName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistMoveName,
            tracks: [track.id]
          },
          {
            name: playlistName,
            tracks: [track.id]
          }
        ])
      }
    })

    it('Add track to moved playlist', async () => {
      const user = TEST_USER1
      const playlistName = TEST_PLAYLIST_MOVE_NAME1
      const track = TEST_TRACK2
      await getStorage().playlistAdd(user, playlistName, [track.id])
    })

    it('Verify track added to moved playlist', async () => {
      const playlists = await getStorage().getPlaylists(TEST_USER1)

      assert.deepEqual(playlists, [
        {
          name: TEST_PLAYLIST_MOVE_NAME1,
          tracks: [TEST_TRACK1.id, TEST_TRACK2.id]
        },
        {
          name: TEST_PLAYLIST_NAME1,
          tracks: [TEST_TRACK1.id]
        }
      ])
    })

    it('Reorder unknown playlist', async () => {
      const user = TEST_USER1
      const playlistName = 'unknownPlaylist'
      const selection = [[0, TEST_TRACK1.id]]
      const insertAt = 2
      const msg = `Error: Did not find playlist ${playlistName}`
      await assertThrows(
        'playlistReorder',
        getStorage().playlistReorder,
        [user, playlistName, selection, insertAt],
        msg,
        getStorage()
      )
    })

    it('Reorder moved playlist', async () => {
      const user = TEST_USER1
      const playlistName = TEST_PLAYLIST_MOVE_NAME1
      const selection = [[0, TEST_TRACK1.id]]
      const insertAt = 2
      const playlists = await getStorage().playlistReorder(
        user,
        playlistName,
        selection,
        insertAt
      )
    })

    it('Verify moved playlist reordering', async () => {
      const user = TEST_USER1
      const playlists = await getStorage().getPlaylists(user)

      assert.deepEqual(playlists, [
        {
          name: TEST_PLAYLIST_MOVE_NAME1,
          tracks: [TEST_TRACK2.id, TEST_TRACK1.id]
        },
        {
          name: TEST_PLAYLIST_NAME1,
          tracks: [TEST_TRACK1.id]
        }
      ])
    })

    it('Cannot delete unknown playlist', async () => {
      const user = TEST_USER1
      const playlist = 'unknownPlaylistName'
      const msg = `Error: Cannot delete unknown playlist: ${playlist}`

      await assertThrows(
        'deletePlaylist',
        getStorage().deletePlaylist,
        [user, playlist],
        msg,
        getStorage()
      )
    })

    it('Delete moved playlists', async () => {
      for (const [user, playlist] of zip(
        TEST_USERS,
        TEST_PLAYLIST_MOVE_NAMES
      )) {
        await getStorage().deletePlaylist(user, playlist)
      }
    })

    it('Playlist removals are reflected in db', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistName,
            tracks: [track.id]
          }
        ])
      }
    })

    it('Track deletion is reflected in tracks and playlists', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        await getStorage().deleteTracks(user, [track.id])
        const tracks = await getStorage().getLibrary(user)
        assert.isEmpty(tracks)
        const playlists = await getStorage().getPlaylists(user)
        assert.deepEqual(playlists, [
          {
            name: playlistName,
            tracks: []
          }
        ])
      }
    })
  })
}
