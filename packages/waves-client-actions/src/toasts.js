const types = require('waves-action-types')

const DEFAULT_TIMEOUT = 3000

let id = 0
let cachedDispatch

function toastRemoveCached(id) {
  cachedDispatch({ type: types.TOAST_REMOVE, id })
}

function toastRemove(id) {
  return { type: types.TOAST_REMOVE, id }
}

function toastAdd(toast) {
  return dispatch => {
    cachedDispatch = dispatch
    toast.id = ++id
    dispatch({ type: types.TOAST_ADD, toast })
    setTimeout(
      () => toastRemoveCached(toast.id),
      toast.timeout || DEFAULT_TIMEOUT
    )
  }
}

module.exports.toastAdd = toastAdd
module.exports.toastRemove = toastRemove
