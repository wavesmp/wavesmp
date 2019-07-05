/* MongoDB supports schema validators. However, error
 * messages are not friendly. See
 * https://jira.mongodb.org/browse/SERVER-20547
 *
 * As a result, DB inputs are manually validated */

const { ObjectID } = require('mongodb')

const MAX_STRING_LENGTH = 64
const MIN_STRING_LENGTH = 1
const MAX_DURATION = 3600 // 1 hour
const MIN_DURATION = 0
const TRACK_PROPS = new Set([
  'id',
  'source',
  'duration',
  'title',
  'artist',
  'album',
  'genre'
])
const EDITABLE_TRACK_PROPS = new Set(['title', 'artist', 'album', 'genre'])

function validateString(s, prop) {
  if (!isString(s)) {
    throw new Error(`${prop} must be a string`)
  }
  const { length } = s
  if (length < MIN_STRING_LENGTH) {
    throw new Error(`${prop} length must be at least ${MIN_STRING_LENGTH}`)
  }
  if (length > MAX_STRING_LENGTH) {
    throw new Error(`${prop} length must be at most ${MAX_STRING_LENGTH}`)
  }
}

function validateTracks(tracks) {
  if (!Array.isArray(tracks)) {
    throw new Error('tracks must be an array')
  }
  for (const track of tracks) {
    if (!isObject(track)) {
      throw new Error('track must be an object')
    }

    /* Check for invalid props */
    for (const prop in track) {
      if (!TRACK_PROPS.has(prop)) {
        throw new Error(`Invalid track prop ${prop}`)
      }
    }

    /* Check required props */
    const { id, source, duration } = track
    if (!ObjectID.isValid(id)) {
      throw new Error('Invalid object ID')
    }
    validateString(id, 'id')
    validateString(source, 'source')
    validateDuration(duration)

    /* Check optional props */
    for (const prop of EDITABLE_TRACK_PROPS) {
      if (prop in track) {
        validateString(track[prop], prop)
      }
    }
  }
}

function validateTrackUpdate(update) {
  if (!isObject(update)) {
    throw new Error('track update must be an object')
  }

  /* Check for invalid props */
  for (const prop in update) {
    if (!EDITABLE_TRACK_PROPS.has(prop)) {
      throw new Error(`Invalid track update prop ${prop}`)
    }
    validateString(update[prop], prop)
  }
}

function validateTrackIds(ids) {
  if (!Array.isArray(ids)) {
    throw new Error('Track ids must be an array')
  }
  for (const id of ids) {
    validateString(id)
  }
}

function validateSelection(selection, tracks, name) {
  if (!Array.isArray(selection)) {
    throw new Error('Selection must be an array')
  }
  const indexToId = new Map()
  for (const entry of selection) {
    if (!Array.isArray(entry)) {
      throw new Error('Selection entry must be an array')
    }
    if (entry.length !== 2) {
      throw new Error(`Invalid selection entry length ${entry.length}`)
    }
    const [index, id] = entry
    validateNumber(index, 'index')
    validateString(id, 'id')
    if (indexToId.has(index)) {
      throw new Error(`Duplicate index ${index} in selection`)
    }
    if (index < 0 || index >= tracks.length) {
      throw new Error(
        `Selection index ${index} out of bounds for playlist ${name}`
      )
    }
    if (tracks[index] !== id) {
      throw new Error(`Selection index mismatch ${index} for playlist ${name}`)
    }
    indexToId.set(index, id)
  }
  return indexToId
}

function validateNumber(n, name) {
  if (!Number.isFinite(n)) {
    throw new Error(`${name} must be a number`)
  }
}

function validateDuration(duration) {
  validateNumber(duration, 'duration')
  if (duration < MIN_DURATION) {
    throw new Error(`duration must be at least ${MIN_DURATION}`)
  }
  if (duration > MAX_DURATION) {
    throw new Error(`duration must be at most ${MAX_DURATION}`)
  }
}

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function isString(s) {
  return typeof s === 'string'
}

module.exports.validateNumber = validateNumber
module.exports.validateSelection = validateSelection
module.exports.validateString = validateString
module.exports.validateTracks = validateTracks
module.exports.validateTrackUpdate = validateTrackUpdate
module.exports.validateTrackIds = validateTrackIds
module.exports.MAX_STRING_LENGTH = MAX_STRING_LENGTH
module.exports.MIN_STRING_LENGTH = MIN_STRING_LENGTH
module.exports.MAX_DURATION = MAX_DURATION
module.exports.MIN_DURATION = MIN_DURATION
module.exports.EDITABLE_TRACK_PROPS = EDITABLE_TRACK_PROPS
