const { combineReducers } = require('redux')

const account = require('./account')
const contextmenu = require('./contextmenu')
const dropdown = require('./dropdown')
const err = require('./err')
const modal = require('./modal')
const sidebar = require('./sidebar')
const toasts = require('./toasts')
const tracks = require('./tracks')
const transitions = require('./transitions')

const combined = combineReducers({
  tracks,
  contextmenu,
  dropdown,
  err,
  modal,
  sidebar,
  toasts,
  transitions,
  account
})

module.exports = combined
