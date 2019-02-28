const MESSAGE = 'Failed to upload track'

class UploadError extends Error {
  constructor(track, cause) {
    super(MESSAGE)
    this.message = MESSAGE
    this.name = this.constructor.name
    this.track = track
    this.cause = cause

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UploadError)
    }
  }
}

module.exports.UploadError = UploadError
