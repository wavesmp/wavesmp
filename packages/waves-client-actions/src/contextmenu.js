const types = require('waves-action-types')

function contextmenuReset() {
  return { type: types.CONTEXTMENU_RESET }
}

function getTransform(x, y) {
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
  const { pageX: x, pageY: y } = ev
  menu.transform = getTransform(x, y)
  return { type: types.CONTEXTMENU_SET, menu }
}

function getOffset(elem) {
  const { left, top } = elem.getBoundingClientRect()
  return {
    left: left + window.scrollX,
    top: top + window.scrollY
  }
}

/* Set context menu based on element position
 * i.e. ev.currentTarget */
function contextmenuSetElem(menu) {
  const { ev } = menu
  const { currentTarget: elem } = ev
  const { offsetWidth: width, offsetHeight: height } = elem
  const { left, top } = getOffset(elem)
  const x = left + width
  const y = top + height
  menu.transform = getTransform(x, y)
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
module.exports.contextmenuSetElem = contextmenuSetElem
module.exports.contextmenuNext = contextmenuNext
module.exports.contextmenuBack = contextmenuBack
