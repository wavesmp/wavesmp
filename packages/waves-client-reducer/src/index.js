const { combineReducers } = require('redux')

const account = require('./account')
const err = require('./err')
const layout = require('./layout')
const menu = require('./menu')
const menubar = require('./menubar')
const modal = require('./modal')
const sidebar = require('./sidebar')
const toasts = require('./toasts')
const tracks = require('./tracks')

const combined = combineReducers({
  account,
  err,
  layout,
  menu,
  menubar,
  modal,
  sidebar,
  toasts,
  tracks
})

module.exports = combined
