const { combineReducers } = require('redux')

const account = require('./account')
const contextmenu = require('./contextmenu')
const dropdown = require('./dropdown')
const err = require('./err')
const menubar = require('./menubar')
const modal = require('./modal')
const sidebar = require('./sidebar')
const toasts = require('./toasts')
const tracks = require('./tracks')
const layout = require('./layout')

const combined = combineReducers({
  tracks,
  contextmenu,
  dropdown,
  err,
  menubar,
  modal,
  sidebar,
  toasts,
  layout,
  account
})

module.exports = combined
