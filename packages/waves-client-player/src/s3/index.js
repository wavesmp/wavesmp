const Promise = require('bluebird')

const S3Client = require('./client')

class S3Player {
  constructor(opts) {
    this.stream = new Audio()
    this.client = new S3Client(opts)
  }

  // Must be called to initialize
  login(idp, idpId, token) {
    this.client.login(idp, idpId, token)
  }

  setOnTrackEnded(onTrackEnded) {
    this.stream.addEventListener('ended', onTrackEnded)
  }

  async trackNext(track, isPlaying) {
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
    try {
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
    } catch (err) {
      console.log('Unexpected error while uploading all tracks')
      console.log(err)
      return null
    }
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

      const resp = await this.client.putTrack(track.id, file)
      console.log('GOT UPLOAD TRACK RESP')
      console.log(resp)

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
      console.log('DELETING TRACKS')
      console.log(tracks)
      const resp = await this.client.deleteTracks(tracks)
      const { Deleted: deleted, Errors: errors } = resp
      console.log('GOT RESP')
      console.log(resp)
      for (const err of errors) {
        const { Track: track, Message: message } = err
        const msg = `Delete failed: ${message}`
        toastr.error(`${track.artist} - ${track.title}`, msg)
        console.log(msg)
        console.log(err)
      }
      for (const track of deleted) {
        toastr.success(`${track.artist} - ${track.title}`, 'Track deleted')
      }
      return deleted
    } catch (err) {
      const msg = 'Failed to delete from S3'
      toastr.error(err.toString(), msg)
      console.log(msg)
      console.log(err)
      return []
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
