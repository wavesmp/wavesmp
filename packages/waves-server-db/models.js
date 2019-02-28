/*
 * A Multi-tenant Architecture was chosen for data storage
 * instead of a Dedicated one.
 */
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const MAX_STRING_LENGTH = 64
const MAX_DURATION = 3600 // 1 hour
const MIN_DURATION = 0

/* Common operations for users:
 * - Fetch single user (idp, idpId) */
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'user email is required'],
      maxlength: MAX_STRING_LENGTH
    },
    name: {
      type: String,
      required: [true, 'user name is required'],
      maxlength: MAX_STRING_LENGTH
    },
    idp: {
      type: String,
      required: [true, 'user idp is required'],
      maxlength: MAX_STRING_LENGTH
    },
    idpId: {
      type: String,
      required: [true, 'user idpId is required'],
      maxlength: MAX_STRING_LENGTH
    }
  },
  {
    collection: 'user',
    strict: 'throw',
    strictQuery: 'throw'
  }
)
userSchema.index({ idp: 1, idpId: 1 }, { unique: true, sparse: true })
const User = mongoose.model('User', userSchema)

/* Common operations for tracks:
 * - Fetch all for user (idp, idpId) */
const trackSchema = mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId
    },
    /* Defines where to get track. DB ID may also be used.  */
    locator: {
      type: String,
      maxlength: MAX_STRING_LENGTH
    },
    source: {
      type: String,
      required: [true, 'track source is required'],
      maxlength: MAX_STRING_LENGTH
    },

    /* Track info */
    title: {
      type: String,
      maxlength: MAX_STRING_LENGTH
    },
    artist: {
      type: String,
      maxlength: MAX_STRING_LENGTH
    },
    album: {
      type: String,
      maxlength: MAX_STRING_LENGTH
    },
    genre: {
      type: String,
      maxlength: MAX_STRING_LENGTH
    },
    duration: {
      /* In seconds */
      type: Number,
      required: [true, 'track duration is required'],
      min: MIN_DURATION,
      max: MAX_DURATION
    },
    image: {
      /* Image URL */
      type: String,
      maxlength: MAX_STRING_LENGTH
    },

    /* Defines state of track.
     * TODO not yet clearly defined. May be useful for notifications / actions required */
    state: {
      type: String,
      maxlength: MAX_STRING_LENGTH
    },

    /* User (multi-tenant model) */
    idp: {
      type: String,
      required: [true, 'track idp is required'],
      maxlength: MAX_STRING_LENGTH
    },
    idpId: {
      type: String,
      required: [true, 'track idpId is required'],
      maxlength: MAX_STRING_LENGTH
    }
  },
  {
    collection: 'track',
    strict: 'throw',
    strictQuery: 'throw',
    _id: false,
    id: false,
    toObject: {
      versionKey: false,
      transform: trackToObject
    }
  }
)

trackSchema.index({ idp: 1, idpId: 1 }, { sparse: true })

const Track = mongoose.model('Track', trackSchema)

function trackToObject(doc, ret) {
  ret.id = ret._id.toString()
  delete ret._id
  return ret
}

/* Mongoose schema supports toObject, but not fromObject.
 * We use toObject to expose _id, as id, and need fromObject
 * to do the inverse.
 * The following options failed:
 * - Use a pre('save') hook to convert the id to _id.
 *   Since id is not in the schema, it gets dropped and is not visible in hook.
 * - Tried using both model.create and new Track(obj).save()
 *
 * As a workaround, call this function before calling mongoose. */
function trackFromObject(track) {
  if (track.id) {
    track = { ...track }
    track._id = track.id
    delete track.id
  }
  return track
}

/* Common operations for playlists:
 * - Fetch all for user (idp, idpId) */
const playlistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'playlist name is required'],
      maxlength: MAX_STRING_LENGTH
    },
    tracks: [String],
    /* User (multi-tenant model) */
    idp: {
      type: String,
      required: [true, 'track idp is required'],
      maxlength: MAX_STRING_LENGTH
    },
    idpId: {
      type: String,
      required: [true, 'track idpId is required'],
      maxlength: MAX_STRING_LENGTH
    }
  },
  {
    collection: 'playlist',
    strict: 'throw',
    strictQuery: 'throw'
  }
)
playlistSchema.index({ idp: 1, idpId: 1 }, { sparse: true })
const Playlist = mongoose.model('Playlist', playlistSchema)

function validatePlaylistTrackIds(trackIds, name) {
  for (const trackId of trackIds) {
    if (typeof trackId !== 'string') {
      throw new Error(
        `Cannot add track id of invalid type ${typeof trackId} ` +
          `to playlist ${name}`
      )
    }
    if (trackId.length <= 0) {
      throw new Error(`Cannot add empty track id to playlist ${name}`)
    }
    if (trackId.length > MAX_STRING_LENGTH) {
      throw new Error(
        `Cannot add track id longer than ${MAX_STRING_LENGTH} ` +
          `to playlist ${name}`
      )
    }
  }
}

module.exports.Track = Track
module.exports.trackFromObject = trackFromObject
module.exports.Playlist = Playlist
module.exports.User = User
module.exports.MAX_STRING_LENGTH = MAX_STRING_LENGTH
module.exports.MAX_DURATION = MAX_DURATION
module.exports.MIN_DURATION = MIN_DURATION
module.exports.validatePlaylistTrackIds = validatePlaylistTrackIds
