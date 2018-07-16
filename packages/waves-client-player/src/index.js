const S3Player = require('./s3')
const FilePlayer = require('./file')

const sourceTypeToClass = {
  s3: S3Player,
  file: FilePlayer
}

class Player {
  constructor(sourceTypes) {
    this.players = {}
    for (const sourceType in sourceTypes) {
      const sourceTypeArgs = sourceTypes[sourceType]
      const Class = sourceTypeToClass[sourceType]
      this.players[sourceType] = new Class(sourceTypeArgs)
    }
  }

  // Must be called to initialize player
  // Need for auth or adding user info to tracks
  login(idp, idpId, token) {
    for (const source in this.players) {
      const player = this.players[source]
      player.login(idp, idpId, token)
    }
  }

  setOnTrackEnded(onTrackEnded) {
    for (const source in this.players) {
      const player = this.players[source]
      player.setOnTrackEnded(onTrackEnded)
    }
  }

  async trackNext(track, isPlaying) {
    this.pause()
    this.track = track

    await this.players[track.source].trackNext(track, isPlaying)
  }

  async trackToggle(track) {
    this.trackNext(track, true)
  }

  pause() {
    if (!this.track) {
      return
    }
    this.players[this.track.source].pause()
  }

  async repeat() {
    this.seek(0)
    this.play()
  }

  async seek(elapsed) {
    this.players[this.track.source].seek(elapsed)
  }

  play() {
    this.players[this.track.source].play()
  }

  download(track) {
    this.players[track.source].download(track)
  }

  async upload(trackSource, uploads) {
    return await this.players[trackSource].upload(uploads)
  }

  _getTracksBySource(tracks) {
    const tracksBySource = {}
    for (const track of tracks) {
      if (!(track.source in tracksBySource)) {
        tracksBySource[track.source] = []
      }
      tracksBySource[track.source].push(track)
    }
    return tracksBySource
  }

  /* Delete the tracks. Does not return items in the given order.
   * Does now throw. Item will be null if delete failed. */
  async deleteTracks(tracks) {
    const tracksBySource = this._getTracksBySource(tracks)
    const promises = []
    for (const source in tracksBySource) {
      const sourceTracks = tracksBySource[source]
      const sourcePromise = this.players[source].deleteTracks(sourceTracks)
      promises.push(sourcePromise)
    }

    const resolved = await Promise.all(promises)
    // TODO Array.flat method coming soon (stage 3)
    // return resolved.flat()
    return flattenArray(resolved)
  }
}

function flattenArray(arr) {
  const res = []
  for (const elem of arr) {
    if (Array.isArray(elem)) {
      res.push.apply(res, elem)
    } else {
      res.push(elem)
    }
  }
  return res
}

module.exports = Player
