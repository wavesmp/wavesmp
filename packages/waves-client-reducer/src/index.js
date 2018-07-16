const { combineReducers } = require('redux')

const tracks = require('./tracks')
const contextmenu = require('./contextmenu')
const modal = require('./modal')
const sidebar = require('./sidebar')
const account = require('./account')
const transitions = require('./transitions')


const combined = combineReducers({
  tracks,
  contextmenu,
  modal,
  sidebar,
  transitions,
  account
})

module.exports = combined
