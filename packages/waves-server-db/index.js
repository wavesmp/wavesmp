const { MongoClient, ObjectID } = require('mongodb')

const { reorder } = require('./reorder')
const {
  validateNumber,
  validateSelection,
  validateString,
  validateTrackIds,
  validateTrackUpdate,
  validateTracks
} = require('./validators')

class Storage {
  constructor(conf) {
    if (!conf) {
      /* Do nothing to allow for mocking */
      return
    }
    this.conf = conf
    this.client = new MongoClient(this.conf.url, { useNewUrlParser: true })
  }

  /* A Multi-tenant Architecture was chosen for data storage
   * instead of a Dedicated one. */
  async connect() {
    await this.client.connect()
    this.db = this.client.db('waves')

    this.user = await this.db.createCollection('user')
    /* Optimize fetch single user (idp, idpId) */
    this.user.createIndex({ idp: 1, idpId: 1 }, { unique: true, sparse: true })

    this.track = await this.db.createCollection('track')
    /* Optimize fetch all for user (idp, idpId) */
    this.track.createIndex({ idp: 1, idpId: 1 }, { sparse: true })

    this.playlist = await this.db.createCollection('playlist')
    /* Optimize fetch all for user (idp, idpId)
     * Names should be unique to throw errors on conflict */
    this.playlist.createIndex(
      { idp: 1, idpId: 1, name: 1 },
      { unique: true, sparse: true }
    )
  }

  close() {
    return this.client.close()
  }

  /* For testing only */
  async getUserInternal(idp, idpId) {
    const user = await this.user.findOne({ idp, idpId })
    delete user._id
    return user
  }

  async createOrUpdateUser(idp, idpId, email, name) {
    validateString(idp, 'idp')
    validateString(idpId, 'idpId')
    validateString(email, 'email')
    validateString(name, 'name')

    const user = { idp, idpId, email, name }
    await this.user.updateOne({ idp, idpId }, { $set: user }, { upsert: true })
  }

  async getLibrary({ idp, idpId }) {
    const cursor = this.track.find({ idp, idpId })
    /* It may be worth looking into cursor.transformStream
     * for improved performance */
    const dbTracks = await cursor.toArray()
    dbTracks.forEach(track => {
      track.id = track._id.toHexString()
      delete track._id
      delete track.idp
      delete track.idpId
    })
    return dbTracks
  }

  validateInsertManyResponse(resp, items) {
    const { insertedCount, insertedIds } = resp
    if (insertedCount === items.length) {
      return
    }
    const failedItems = []
    for (let i = 0; i < items.length; i += 1) {
      if (i in insertedIds) {
        continue
      }
      failedItems.push(items[i])
    }

    console.log('insertMany() failed. Failed Docs:')
    console.log(failedItems)
    throw new Error('Failed to insert items into DB')
  }

  async addTracks({ idp, idpId }, tracks) {
    validateTracks(tracks)
    tracks.forEach(track => {
      track._id = new ObjectID(track.id)
      delete track.id
      track.idp = idp
      track.idpId = idpId
    })
    const insertResp = await this.track.insertMany(tracks)
    this.validateInsertManyResponse(insertResp, tracks)
  }

  validateResponse(resp) {
    const { ok } = resp
    if (ok !== 1) {
      console.log('Error in DB response')
      console.log(resp)
      throw new Error(`DB response error code: ${ok}`)
    }
  }

  async updateTrack({ idp, idpId }, _id, trackUpdate) {
    _id = new ObjectID(_id)
    validateTrackUpdate(trackUpdate)
    trackUpdate = { ...trackUpdate, idp, idpId }
    const updateResp = await this.track.findOneAndUpdate(
      { _id, idp, idpId },
      { $set: trackUpdate }
    )
    this.validateResponse(updateResp)
    if (!updateResp.value) {
      throw new Error(`Cannot update unknown track: ${_id}`)
    }
  }

  async deleteTracks(user, trackIds) {
    const { idp, idpId } = user
    validateTrackIds(trackIds)
    const objectIds = trackIds.map(ObjectID)
    await this.playlist.updateMany(
      { idp, idpId },
      { $pull: { tracks: { $in: trackIds } } }
    )
    await this.track.deleteMany({ idp, idpId, _id: { $in: objectIds } })
  }

  playlistToObject(playlist) {
    delete playlist._id
    delete playlist.idp
    delete playlist.idpId
  }

  async getPlaylists({ idp, idpId }) {
    const cursor = this.playlist.find({ idp, idpId })
    const dbPlaylists = await cursor.toArray()
    dbPlaylists.forEach(this.playlistToObject)
    return dbPlaylists
  }

  async playlistAdd({ idp, idpId }, name, tracks) {
    validateTrackIds(tracks)
    validateString(name, 'name')

    const updateResp = await this.playlist.findOneAndUpdate(
      { idp, idpId, name },
      { $push: { tracks: { $each: tracks } } },
      { returnOriginal: false, upsert: true }
    )
    this.validateResponse(updateResp)
    return updateResp.value.tracks
  }

  /* The selection contains ids/indexes to ensure
   * removal only if id is present at index */
  async tracksRemove({ idp, idpId }, name, selection) {
    const dbPlaylist = await this.playlist.findOne({ idp, idpId, name })

    if (!dbPlaylist) {
      throw new Error(`Cannot remove from unknown playlist: ${name}`)
    }

    const { tracks } = dbPlaylist
    const removeIndexToId = validateSelection(selection, tracks, name)
    const updatedTracks = tracks.filter((_, i) => !removeIndexToId.has(i))

    const updateResp = await this.playlist.findOneAndUpdate(
      { idp, idpId, name, tracks },
      { $set: { tracks: updatedTracks } },
      { returnOriginal: false }
    )
    this.validateResponse(updateResp)
    if (updateResp.value) {
      return updateResp.value.tracks
    }
    throw new Error(`Failed to find playlist ${name} while removing`)
  }

  async playlistCopy({ idp, idpId }, name, destName) {
    const dbPlaylist = await this.playlist.findOne({ idp, idpId, name })
    if (!dbPlaylist) {
      throw new Error(`Cannot copy unknown playlist: ${name}`)
    }

    delete dbPlaylist._id
    dbPlaylist.name = destName
    await this.playlist.insertOne(dbPlaylist)
  }

  async playlistMove({ idp, idpId }, name, destName) {
    validateString(name, 'source name')
    validateString(destName, 'destination name')
    const updateResp = await this.playlist.updateOne(
      { name, idp, idpId },
      { $set: { name: destName } }
    )
    if (updateResp.matchedCount !== 1 || updateResp.modifiedCount !== 1) {
      throw new Error(`Cannot move unknown playlist ${name}`)
    }
  }

  async playlistReorder({ idp, idpId }, name, selection, insertAt) {
    validateString(name, 'name')
    validateNumber(insertAt, 'insertAt')
    const dbTrack = await this.playlist.findOne({ name, idp, idpId })
    if (!dbTrack) {
      throw new Error(`Did not find playlist ${name}`)
    }
    const { tracks } = dbTrack
    const indexToId = validateSelection(selection, tracks, name)
    const reordered = reorder(tracks, indexToId, insertAt)

    const updateResp = await this.playlist.findOneAndUpdate(
      { idp, idpId, name, tracks },
      { $set: { tracks: reordered } },
      { returnOriginal: false }
    )
    this.validateResponse(updateResp)
    if (updateResp.value) {
      return updateResp.value.tracks
    }
    throw new Error(`Failed to find playlist ${name} while reordering`)
  }

  async deletePlaylist({ idp, idpId }, name) {
    const deleteResp = await this.playlist.deleteOne({ name, idp, idpId })
    if (deleteResp.deletedCount !== 1) {
      throw new Error(`Cannot delete unknown playlist: ${name}`)
    }
  }
}

module.exports = Storage
