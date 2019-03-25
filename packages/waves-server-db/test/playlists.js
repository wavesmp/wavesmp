const { assert } = require('chai')
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
  TEST_PLAYLIST_NAME1,
  TEST_PLAYLIST_NAME2,
  TEST_PLAYLIST_COPY_NAME1,
  TEST_PLAYLIST_COPY_NAME2,
  TEST_PLAYLIST_MOVE_NAME1,
  TEST_PLAYLIST_MOVE_NAME2,
  TEST_TRACK_ID
} = require('waves-test-data')

const { MAX_STRING_LENGTH } = require('../models')

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
        assert.isEmpty(playlists, `Playlists not empty for user ${user.name}`)
        assert.typeOf(playlists, 'array')
      }
    })

    it('Playlist name cannot be empty', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const msg = 'ValidationError: name: playlist name is required'
      for (const emptyVal of [null, undefined, '']) {
        await assertThrows(
          'playlistAdd',
          getStorage().playlistAdd,
          [user, emptyVal, [track.id]],
          msg
        )
      }
    })

    it('Playlist name has max value', async () => {
      const user = TEST_USER1
      const val = generateString(MAX_STRING_LENGTH + 1)
      const track = TEST_TRACK1
      const msg =
        `ValidationError: name: Path \`name\` ` +
        `(\`${val}\`) is longer than the maximum allowed ` +
        `length (${MAX_STRING_LENGTH}).`
      await assertThrows(
        'playlistAdd',
        getStorage().playlistAdd,
        [user, val, [track.id]],
        msg
      )
    })

    it('Playlist tracks cannot be empty', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const val = ''
      const playlistName = TEST_PLAYLIST_NAME1
      const msg =
        `Error: Cannot add empty track id ` + `to playlist ${playlistName}`
      await assertThrows(
        'playlistAdd',
        getStorage().playlistAdd,
        [user, playlistName, [val]],
        msg
      )
    })

    it('Playlist tracks should be string types', async () => {
      const user = TEST_USER1
      const track = TEST_TRACK1
      const val = null
      const playlistName = TEST_PLAYLIST_NAME1
      const msg =
        `Error: Cannot add track id of invalid type ` +
        `object to playlist ${playlistName}`
      await assertThrows(
        'playlistAdd',
        getStorage().playlistAdd,
        [user, playlistName, [val]],
        msg
      )
    })

    it('Failed attempts to not update db', async () => {
      for (const user of TEST_USERS) {
        const playlists = await getStorage().getPlaylists(user)
        assert.isEmpty(playlists, `Playlists not empty for user ${user.name}`)
        assert.typeOf(playlists, 'array')
      }
    })

    it('Add playlist tracks for users', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        await getStorage().playlistAdd(user, playlistName, [track.id])
      }
    })

    it('Playlist add is visible in user playlists', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 1)
        const playlist = playlists[0]
        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlist.tracks.length, 1)
        assert.strictEqual(playlist.tracks[0], track.id)
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
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 1)
        const playlist = playlists[0]
        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlist.tracks.length, 2)
        assert.strictEqual(playlist.tracks[0], track.id)
        assert.strictEqual(playlist.tracks[1], TEST_TRACK_ID)
      }
    })

    it('Playlist second add is visible in user playlists', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 1)
        const playlist = playlists[0]
        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlist.tracks.length, 2)
        assert.strictEqual(playlist.tracks[0], track.id)
        assert.strictEqual(playlist.tracks[1], TEST_TRACK_ID)
      }
    })

    it('Cannot remove from unknown playlist', async () => {
      const user = TEST_USER1
      const playlistName = 'unknownPlaylist'
      const index = 0
      const msg = `Error: Cannot remove from unknown playlist: ${playlistName}`
      await assertThrows(
        'tracksRemove',
        getStorage().tracksRemove,
        [user, playlistName, [index]],
        msg
      )
    })

    it('Cannot remove out of bounds playlist track index', async () => {
      const user = TEST_USER1
      const playlistName = TEST_PLAYLIST_NAME1
      const indexes = [-1, 2]
      for (const index of indexes) {
        const msg =
          `Error: Playlist index ${index} out of range for ` +
          `playlist ${playlistName}`
        await assertThrows(
          'tracksRemove',
          getStorage().tracksRemove,
          [user, playlistName, [index]],
          msg
        )
      }
    })

    it('Remove second playlist track', async () => {
      const combined = zip(TEST_USERS, TEST_PLAYLIST_NAMES)
      for (const [user, playlistName] of combined) {
        await getStorage().tracksRemove(user, playlistName, [1])
      }
    })

    it('Removal is reflected in db', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 1)
        const playlist = playlists[0]
        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlist.tracks.length, 1)
        assert.strictEqual(playlist.tracks[0], track.id)
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
        msg
      )
    })

    it('Cannot copy to existing playlist', async () => {
      const user = TEST_USER1
      const playlistName = TEST_PLAYLIST_NAME1
      const destPlaylistName = TEST_PLAYLIST_NAME1
      const msg = `Error: Cannot copy to existing playlist: ${playlistName}`
      await assertThrows(
        'playlistCopy',
        getStorage().playlistCopy,
        [user, playlistName, destPlaylistName],
        msg
      )
    })

    it('Failed copy attempts do not affect db', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        const playlists = await getStorage().getPlaylists(user)
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 1)
        const playlist = playlists[0]
        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlist.tracks.length, 1)
        assert.strictEqual(playlist.tracks[0], track.id)
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
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 2)

        const playlist = playlists[0]
        const copyPlaylist = playlists[1]

        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(copyPlaylist.name, copyPlaylistName)

        assert.strictEqual(playlist.tracks.length, 1)
        assert.strictEqual(playlist.tracks[0], track.id)

        assert.strictEqual(copyPlaylist.tracks.length, 1)
        assert.strictEqual(copyPlaylist.tracks[0], track.id)
      }
    })

    it('Cannot move unknown playlist', async () => {
      const user = TEST_USER1
      const playlist = 'unknownPlaylistName'
      const destPlaylist = 'unknownPlaylistName2'
      const msg = `Error: Cannot move unknown playlist: ${playlist}`

      await assertThrows(
        'playlistMove',
        getStorage().playlistMove,
        [user, playlist, destPlaylist],
        msg
      )
    })

    it('Cannot move to existing playlist', async () => {
      const user = TEST_USER1
      const playlist = TEST_PLAYLIST_COPY_NAME1
      const destPlaylist = TEST_PLAYLIST_NAME1
      const msg = `Error: Cannot move to existing playlist: ${destPlaylist}`

      await assertThrows(
        'playlistMove',
        getStorage().playlistMove,
        [user, playlist, destPlaylist],
        msg
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
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 2)

        const playlist = playlists[0]
        const copyPlaylist = playlists[1]

        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(copyPlaylist.name, copyPlaylistName)

        assert.strictEqual(playlist.tracks.length, 1)
        assert.strictEqual(playlist.tracks[0], track.id)

        assert.strictEqual(copyPlaylist.tracks.length, 1)
        assert.strictEqual(copyPlaylist.tracks[0], track.id)
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
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 2)

        const playlist = playlists[0]
        const playlistMove = playlists[1]

        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlistMove.name, playlistMoveName)

        assert.strictEqual(playlist.tracks.length, 1)
        assert.strictEqual(playlist.tracks[0], track.id)

        assert.strictEqual(playlistMove.tracks.length, 1)
        assert.strictEqual(playlistMove.tracks[0], track.id)
      }
    })

    it('Cannot delete unknown playlist', async () => {
      const user = TEST_USER1
      const playlist = 'unknownPlaylistName'
      const msg = `Error: Cannot remove unknown playlist: ${playlist}`

      await assertThrows(
        'deletePlaylist',
        getStorage().deletePlaylist,
        [user, playlist],
        msg
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
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 1)
        const playlist = playlists[0]
        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlist.tracks.length, 1)
        assert.strictEqual(playlist.tracks[0], track.id)
      }
    })

    it('Track deletion is reflected in tracks and playlists', async () => {
      const combined = zip(TEST_USERS, TEST_TRACKS, TEST_PLAYLIST_NAMES)
      for (const [user, track, playlistName] of combined) {
        await getStorage().deleteTracks(user, [track.id])
        const tracks = await getStorage().getLibrary(user)
        assert.isEmpty(tracks)
        const playlists = await getStorage().getPlaylists(user)
        assert.isNotEmpty(playlists, `Playlists empty for user ${user.name}`)
        assert.strictEqual(playlists.length, 1)
        const playlist = playlists[0]
        assert.strictEqual(playlist.name, playlistName)
        assert.strictEqual(playlist.tracks.length, 0)
      }
    })
  })
}
