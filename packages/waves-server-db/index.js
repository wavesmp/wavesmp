const mongoose = require('mongoose')

const {
  Track,
  Playlist,
  User,
  trackFromObject,
  validatePlaylistTrackIds
} = require('./models')
const { reorder } = require('./reorder')

class Storage {
  constructor(conf) {
    this.conf = conf
  }

  connect() {
    return mongoose.connect(this.conf.url, {
      useNewUrlParser: true,
      useCreateIndex: true
    })
  }

  close() {
    return mongoose.connection.close()
  }

  /* Get user. For internal testing only. */
  async getUserInternal(idp, idpId) {
    const user = { idp, idpId }
    return await User.findOne(user)
  }

  /* Used to get, create, or update user */
  async getUser(idp, idpId, email, name) {
    const user = { idp, idpId, email, name }
    const dbUser = await User.findOneAndUpdate({ idp, idpId }, user, {
      upsert: true,
      new: true,
      runValidators: true
    })
    return user
  }

  async getLibrary({ idp, idpId }) {
    const dbTracks = await Track.find({ idp, idpId })
    return dbTracks.map(t => t.toObject())
  }

  async getPlaylists({ idp, idpId }) {
    const dbPlaylists = await Playlist.find({ idp, idpId })
    return dbPlaylists.map(p => p.toObject())
  }

  async addTrack(track) {
    track = trackFromObject(track)
    await Track.create(track)
  }

  async updateTrack({ idp, idpId }, _id, trackUpdate) {
    const track = await Track.findOneAndUpdate(
      { _id, idp, idpId },
      trackUpdate,
      { runValidators: true }
    )
    if (!track) {
      throw new Error(`Cannot update track. Unknown id: ${_id}`)
    }
  }

  async playlistAdd(user, name, trackIds) {
    /* Validate track id here, since they are added incrementally */
    validatePlaylistTrackIds(trackIds, name)
    const { idp, idpId } = user
    const playlistQuery = { name, idp, idpId }
    const dbPlaylist = await Playlist.findOne(playlistQuery)

    if (dbPlaylist) {
      const { tracks } = dbPlaylist
      tracks.push(...trackIds)
      await Playlist.findOneAndUpdate(playlistQuery, { tracks })
    } else {
      const playlist = { idp, idpId, name, tracks: trackIds }
      await Playlist.create(playlist)
    }
  }

  async playlistReorder(user, name, selection, insertAt) {
    const { idp, idpId } = user
    const playlistQuery = { name, idp, idpId }
    const dbPlaylist = await Playlist.findOne(playlistQuery)

    if (!dbPlaylist) {
      throw new Error(`Did not find playlist ${name}`)
    }

    const tracks = reorder(dbPlaylist.tracks, selection, insertAt)
    await Playlist.findOneAndUpdate(playlistQuery, { tracks })
  }

  async tracksRemove(user, name, indexes) {
    const { idp, idpId } = user
    const playlistQuery = { idp, idpId, name }

    const dbPlaylist = await Playlist.findOne(playlistQuery)

    if (!dbPlaylist) {
      throw new Error(`Cannot remove from unknown playlist: ${name}`)
    }

    const { tracks } = dbPlaylist

    for (const index of indexes) {
      if (index < 0 || index >= tracks.length) {
        throw new Error(
          `Playlist index ${index} out of range for playlist ${name}`
        )
      }

      tracks.splice(index, 1)
    }

    await Playlist.findOneAndUpdate(playlistQuery, { tracks })
  }

  async playlistCopy(user, name, destName) {
    const { idp, idpId } = user
    const query = { idp, idpId, name }

    const dbPlaylist = await Playlist.findOne(query)
    if (!dbPlaylist) {
      throw new Error(`Cannot copy unknown playlist: ${name}`)
    }

    const destQuery = { idp, idpId, name: destName }
    const destDbPlaylist = await Playlist.findOne(destQuery)
    if (destDbPlaylist) {
      throw new Error(`Cannot copy to existing playlist: ${destName}`)
    }

    const { tracks } = dbPlaylist
    const destPlaylist = {
      idp,
      idpId,
      name: destName,
      tracks
    }

    await Playlist.create(destPlaylist)
  }

  async playlistMove(user, name, destName) {
    const { idp, idpId } = user
    const destQuery = { idp, idpId, name: destName }
    const destDbPlaylist = await Playlist.findOne(destQuery)
    if (destDbPlaylist) {
      throw new Error(`Cannot move to existing playlist: ${destName}`)
    }

    const updated = await Playlist.findOneAndUpdate(
      { name, idp, idpId },
      { name: destName }
    )
    if (!updated) {
      throw new Error(`Cannot move unknown playlist: ${name}`)
    }
  }

  async deletePlaylist(user, name) {
    const { idp, idpId } = user
    const removed = await Playlist.findOneAndRemove({ name, idp, idpId })
    if (!removed) {
      throw new Error(`Cannot remove unknown playlist: ${name}`)
    }
  }

  async deleteTracks(user, trackIds) {
    const { idp, idpId } = user
    await Track.remove({ idp, idpId, _id: { $in: trackIds } })
    await Playlist.update(
      { idp, idpId },
      { $pull: { tracks: { $in: trackIds } } },
      { multi: true }
    )
  }
}

module.exports = Storage
