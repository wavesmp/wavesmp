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
      await this.load()
    }
    this.stream.play();
  }

  pause() {
    this.stream.pause();
  }

  seek(pos) {
    this.stream.currentTime = pos
  }

  async load() {
    if (!this.trackUrl) {
      this.trackUrl = URL.createObjectURL(this.track.file)
    }
    this.stream.src = this.trackUrl
    this.stream.currentTime = 0
    this.loaded = true
  }

  async download(track) {
    toastr.error('Local file download not supported')
  }

  async upload(uploads) {
    toastr.error('Local file upload not supported')
  }
}

module.exports = FilePlayer
