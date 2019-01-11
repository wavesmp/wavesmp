const Promise = require('bluebird')

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

  setOnTimeUpdate(onTimeUpdate) {
    this.stream.addEventListener('timeupdate', () => {
      onTimeUpdate(this.stream.currentTime)
    })
  }

  setOnUploadProgress(onUploadProgress) {
    this.client.setOnUploadProgress(onUploadProgress)
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
      await this.load()
      this.seek(currentTime)
      await this.stream.play()
      return
    }
    toastr.error(err.message, 'Stream Failure')
    console.log('Unexpected stream error')
    console.log(`message: ${err.message}`)
    console.log(`code: ${err.code}`)
  }

  async play() {
    if (!this.loaded) {
      await this.load()
    }
    this.streamErrorRetries = STREAM_ERROR_RETRIES
    await this.stream.play();
  }

  pause() {
    this.stream.pause();
  }

  seek(pos) {
    this.stream.currentTime = pos
  }

  async load() {
    // Ideally, we could call bucket.getObject directly, but it's simpler
    // to get the url and stream it using <Audio>.src = <url>
    try {
      const url = await this.client.getSignedUrl(this.track.id)
      this.stream.src = url
      this.stream.currentTime = 0
      this.loaded = true
    } catch (err) {
      toastr.error(err.toString(), 'S3 Failure')
    }
  }

  async download(track) {
    // Fetch the link for the track and download it programmatically
    try {
      const url = await this.client.getSignedUrl(track.id)
      downloadFile(url)
    } catch (err) {
      toastr.error(err.toString(), 'S3 Failure')
    }
  }

  async upload(uploads) {
    uploads = await Promise.all(uploads.map(this._upload, this))
    const uploaded = []
    const errors = []
    for (const upload of uploads) {
      if (upload.err) {
        errors.push(upload)
      } else {
        uploaded.push(upload)
      }
    }
    return { errors, uploaded }
  }

  /* Upload to s3. Convert tracks to s3 track. */
  async _upload(track) {
    const { file, picture } = track
    try {
      track = {...track}
      track.source = 's3'
      delete track.file
      delete track.picture


      if (picture) {
        // TODO this is not used
        await this.putImage(track.id, picture)
        track.image = picture.format
      }

      await this.client.putTrack(track.id, file)
      toastr.success(file.name, 'Uploaded file')
      return track
    } catch (err) {
      toastr.error(err, 'Upload Failure')
      console.log(`Failed to upload file ${file.name}`)
      console.log(err)
      track.err = err
      return track
    }
  }

  async deleteTracks(tracks) {
    try {
      const resp = await this.client.deleteTracks(tracks)
      const { deleted, errors } = resp
      for (const err of errors) {
        const { track, message } = err
        const msg = `Delete failed: ${message}`
        toastr.error(`${track.artist} - ${track.title}`, msg)
        console.log(msg)
        console.log(err)
      }
      for (const track of deleted) {
        toastr.success(`${track.artist} - ${track.title}`, 'Track deleted')
      }
      return resp
    } catch (err) {
      const msg = 'Failed to delete from S3'
      toastr.error(err.toString(), msg)
      console.log(msg)
      console.log(err)
      return {deleted: [], errors: [err]}
    }
  }
}

// TODO move this to a util function if we want to keep it long term
// TODO not all browser seem to support this...
// Taken from https://github.com/PixelsCommander/Download-File-JS
function downloadFile(url) {
  //Creating new link node.
  var link = document.createElement('a');
  link.href = url;

  //Dispatching click event.
   var e = document.createEvent('MouseEvents');
   e.initEvent('click', true, true);
   link.dispatchEvent(e);
}

module.exports = S3Player
