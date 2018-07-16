const { combineReducers } = require('redux')

const library = require('./library')
const playlists = require('./playlists')
const playing = require('./playing')
const uploads = require('./uploads')

const tracks = combineReducers({
  library,
  playlists,
  playing,
  uploads
})

module.exports = tracks
