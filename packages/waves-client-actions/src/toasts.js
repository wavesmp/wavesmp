const types = require('waves-action-types')

const DEFAULT_TIMEOUT = 3000

let id = 0
let cachedDispatch

function toastRemove() {
  cachedDispatch({ type: types.TOAST_REMOVE })
}

function toastAdd(toast) {
  return dispatch => {
    cachedDispatch = dispatch
    toast.id = ++id
    dispatch({ type: types.TOAST_ADD, toast })
    setTimeout(toastRemove, toast.timeout || DEFAULT_TIMEOUT)
  }
}

module.exports.toastAdd = toastAdd
