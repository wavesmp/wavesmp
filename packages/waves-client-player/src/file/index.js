class FilePlayer {
  constructor() {
    this.stream = new Audio()
  }

  // Must be called to initialize
  login(idp, idpId, token) {
    // No auth needed
  }

  setOnTrackEnded(onTrackEnded) {
    this.stream.addEventListener('ended', onTrackEnded)
  }

  setOnUploadProgress(onUploadProgress) {
    // No local upload supported
  }

  setOnToastAdd(onToastAdd) {
    // No use case for this currently
  }

  setOnTimeUpdate(onTimeUpdate) {
    this.stream.addEventListener('timeupdate', () => {
      onTimeUpdate(this.stream.currentTime)
    })
  }

  async trackNext(track, isPlaying) {
    if (this.trackUrl) {
      URL.revokeObjectURL(this.trackUrl)
      this.trackUrl = null
    }
    this.track = track
    this.loaded = false
    if (isPlaying) {
      await this.play()
    }
  }

  async play() {
    if (!this.loaded) {
      this.load()
    }
    this.stream.play()
  }

  pause() {
    this.stream.pause()
  }

  seek(pos) {
    this.stream.currentTime = pos
  }

  load() {
    if (!this.trackUrl) {
      this.trackUrl = URL.createObjectURL(this.track.file)
    }
    this.stream.src = this.trackUrl
    this.stream.currentTime = 0
    this.loaded = true
  }
}

module.exports = FilePlayer
