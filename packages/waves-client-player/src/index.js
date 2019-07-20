const S3Player = require('./s3')
const FilePlayer = require('./file')

const sourceTypeToClass = {
  s3: S3Player,
  file: FilePlayer
}

class Player {
  constructor(sourceTypes) {
    this.defaultTrackSource = sourceTypes.defaultTrackSource
    delete sourceTypes.defaultTrackSource

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

  setOnUploadProgress(onUploadProgress) {
    for (const source in this.players) {
      const player = this.players[source]
      player.setOnUploadProgress(onUploadProgress)
    }
  }

  addOnTimeUpdate(onTimeUpdate) {
    for (const source in this.players) {
      const player = this.players[source]
      player.addOnTimeUpdate(onTimeUpdate)
    }
  }

  removeOnTimeUpdate(onTimeUpdate) {
    for (const source in this.players) {
      const player = this.players[source]
      player.removeOnTimeUpdate(onTimeUpdate)
    }
  }

  addOnVolumeChange(onVolumeChange) {
    for (const source in this.players) {
      const player = this.players[source]
      player.addOnVolumeChange(onVolumeChange)
    }
  }

  removeOnVolumeChange(onVolumeChange) {
    for (const source in this.players) {
      const player = this.players[source]
      player.removeOnVolumeChange(onVolumeChange)
    }
  }

  getVolume() {
    for (const source in this.players) {
      const player = this.players[source]
      /* Player vol should be in sync.
       * Return the first one */
      return player.getVolume()
    }
  }

  setVolume(volume) {
    for (const source in this.players) {
      const player = this.players[source]
      player.setVolume(volume)
    }
  }

  setOnToastAdd(onToastAdd) {
    for (const source in this.players) {
      const player = this.players[source]
      player.setOnToastAdd(onToastAdd)
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

  async download(track) {
    await this.players[track.source].download(track)
  }

  upload(trackSource, uploads) {
    if (!trackSource) {
      trackSource = this.defaultTrackSource
    }
    return this.players[trackSource].upload(uploads)
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
   * Does not throw or block. */
  async deleteTracks(tracks) {
    const tracksBySource = this._getTracksBySource(tracks)
    const promises = []
    for (const source in tracksBySource) {
      const sourceTracks = tracksBySource[source]
      const sourcePromise = this.players[source].deleteTracks(sourceTracks)
      promises.push(sourcePromise)
    }
    return promises
  }
}

module.exports = Player
