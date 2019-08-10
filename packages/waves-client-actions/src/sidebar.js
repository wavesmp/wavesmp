const types = require('waves-action-types')

function sidebarModeSet(sidebar) {
  return { type: types.SIDEBAR_SET, sidebar }
}

module.exports.sidebarModeSet = sidebarModeSet
