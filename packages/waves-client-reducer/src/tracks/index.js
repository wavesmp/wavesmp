const { combineReducers } = require('redux')

const libraries = require('./libraries')
const playlists = require('./playlists')
const playing = require('./playing')

const tracks = combineReducers({
  libraries,
  playlists,
  playing
})

module.exports = tracks
