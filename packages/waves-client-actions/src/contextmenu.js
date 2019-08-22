const types = require('waves-action-types')

function contextmenuReset() {
  return { type: types.CONTEXTMENU_RESET }
}

function getTransform(ev) {
  const { pageX: x, pageY: y } = ev
  const { pageXOffset, innerWidth } = window
  const hasRightSpace = pageXOffset + innerWidth - x >= CONTEXTMENU_WIDTH
  if (hasRightSpace) {
    return `translate(${x}px, ${y}px)`
  }
  return `translate(calc(${x}px - 100%), ${y}px)`
}

/* Set context menu based on click position
 * i.e. ev.pageX, ev.pageY */
function contextmenuSet(menu) {
  const { ev } = menu
  menu.transform = getTransform(ev)
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
