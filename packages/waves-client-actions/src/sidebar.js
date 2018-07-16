const types = require('waves-action-types')

function sidebarModeSet(mode) {
  return { type: types.SIDEBAR_MODE_SET, mode}
}

module.exports.sidebarModeSet = sidebarModeSet
