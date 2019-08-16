const types = require('waves-action-types')

function menubarSet(menubar) {
  return { type: types.MENUBAR_SET, menubar }
}

module.exports.menubarSet = menubarSet
