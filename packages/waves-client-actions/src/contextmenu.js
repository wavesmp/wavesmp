const types = require('waves-action-types')

function contextmenuReset() {
  return { type: types.CONTEXTMENU_RESET }
}

function contextmenuSet(menu) {
  return { type: types.CONTEXTMENU_SET, menu }
}

function contextmenuNext(menu) {
  return { type: types.CONTEXTMENU_NEXT, menu }
}

function contextmenuBack() {
  return { type: types.CONTEXTMENU_BACK }
}

module.exports.contextmenuReset = contextmenuReset
module.exports.contextmenuSet = contextmenuSet
module.exports.contextmenuNext = contextmenuNext
module.exports.contextmenuBack = contextmenuBack
