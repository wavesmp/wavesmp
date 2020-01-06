const types = require('waves-action-types')

function menuReset() {
  return { type: types.MENU_RESET }
}

function getTransform(x, y) {
  const { pageXOffset, innerWidth } = window
  const hasRightSpace = pageXOffset + innerWidth - x >= MENU_WIDTH
  if (hasRightSpace) {
    return `translate(${x}px, ${y}px)`
  }
  return `translate(calc(${x}px - 100%), ${y}px)`
}

/* Set menu based on click position
 * i.e. ev.pageX, ev.pageY */
function menuSet(menu) {
  const { ev } = menu
  const { pageX: x, pageY: y } = ev
  menu.transform = getTransform(x, y)
  return { type: types.MENU_SET, menu }
}

function getOffset(elem) {
  const { left, top } = elem.getBoundingClientRect()
  return {
    left: left + window.scrollX,
    top: top + window.scrollY
  }
}

/* Set menu based on element position
 * i.e. ev.currentTarget */
function menuSetElem(menu) {
  const { ev } = menu
  const { currentTarget: elem } = ev
  const { offsetWidth: width, offsetHeight: height } = elem
  const { left, top } = getOffset(elem)
  const x = left + width
  const y = top + height
  menu.transform = getTransform(x, y)
  return { type: types.MENU_SET, menu }
}

function menuNext(menu) {
  return { type: types.MENU_NEXT, menu }
}

function menuBack() {
  return { type: types.MENU_BACK }
}

module.exports.menuReset = menuReset
module.exports.menuSet = menuSet
module.exports.menuSetElem = menuSetElem
module.exports.menuNext = menuNext
module.exports.menuBack = menuBack
