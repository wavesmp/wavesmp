const { toastTypes } = require('waves-client-constants')
const { UploadError } = require('waves-client-errors')

const S3Client = require('./client')

const STREAM_ERROR_RETRIES = 1

class S3Player {
  constructor(opts) {
    this.stream = new Audio()
    this.stream.onerror = this.onStreamError.bind(this)
    this.streamErrorRetries = STREAM_ERROR_RETRIES
    this.client = new S3Client(opts)
  }

  // Must be called to initialize
  login(idp, idpId, token) {
    this.client.login(idp, idpId, token)
  }

  setOnTrackEnded(onTrackEnded) {
    this.stream.addEventListener('ended', onTrackEnded)
  }

  addOnTimeUpdate(onTimeUpdate) {
    this.stream.addEventListener('timeupdate', onTimeUpdate)
  }

  removeOnTimeUpdate(onTimeUpdate) {
    this.stream.removeEventListener('timeupdate', onTimeUpdate)
  }

  setOnUploadProgress(onUploadProgress) {
    this.client.setOnUploadProgress(onUploadProgress)
  }

  setOnToastAdd(onToastAdd) {
    this.onToastAdd = onToastAdd
  }

  async trackNext(track, isPlaying) {
    this.track = track
    this.loaded = false
    if (isPlaying) {
      await this.play()
    }
  }

  /* Audio source URLs may expire, which can lead to a 403 Forbidden
   * http code. This results in a stream error code MEDIA_ERR_NETWORK.
   * Catch these errors and retry. Update this code if there is a way
   * to check underlying http code. */
  async onStreamError() {
    const err = this.stream.error
    if (this.streamErrorRetries && err.code === err.MEDIA_ERR_NETWORK) {
      console.log('Got stream network error. Retrying')
      this.streamErrorRetries -= 1
      const { currentTime } = this.stream
      console.log(`Retrying playback at time ${currentTime}`)
      try {
        await this.load()
        this.seek(currentTime)
        await this.stream.play(true)
        return
      } catch (err) {
        this.onToastAdd({ type: toastTypes.Error, msg: `Stream error: ${err}` })
        console.log('Error attempting to reload and play')
        console.log(err)
      }
    }
    this.onToastAdd({
      type: toastTypes.Error,
      msg: `Stream error: ${err.message}`
    })
    console.log('Unexpected stream error')
    console.log(`message: ${err.message}`)
    console.log(`code: ${err.code}`)
  }

  async play(isRetry) {
    if (!this.loaded) {
      await this.load()
    }
    if (!isRetry) {
      this.streamErrorRetries = STREAM_ERROR_RETRIES
    }
    await this.stream.play()
  }

  pause() {
    this.stream.pause()
  }

  seek(pos) {
    this.stream.currentTime = pos
  }

  async load() {
    // Ideally, we could call bucket.getObject directly, but it's simpler
    // to get the url and stream it using <Audio>.src = <url>
    const url = await this.client.getSignedUrl(this.track.id)
    this.stream.src = url
    this.stream.currentTime = 0
    this.loaded = true
  }

  async download(track) {
    // Fetch the link for the track and download it programmatically
    const url = await this.client.getSignedUrl(track.id)
    downloadFile(url)
  }

  /* Return array of promises, so caller can handle
   * errors as they arrive */
  upload(uploads) {
    return uploads.map(this._upload, this)
  }

  /* Upload to s3. Convert tracks to s3 track. */
  async _upload(track) {
    /* Make a copy. In upload failure case, original
     * 'file' track remains intact */
    track = { ...track, source: 's3' }
    try {
      await this.client.putTrack(track.id, track.file)
      return track
    } catch (err) {
      throw new UploadError(track, cause)
    }
  }

  async deleteTracks(tracks) {
    return await this.client.deleteTracks(tracks)
  }
}

// Taken from https://github.com/PixelsCommander/Download-File-JS
function downloadFile(url) {
  //Creating new link node.
  const link = document.createElement('a')
  link.href = url

  //Dispatching click event.
  const e = document.createEvent('MouseEvents')
  e.initEvent('click', true, true)
  link.dispatchEvent(e)
}

module.exports = S3Player
