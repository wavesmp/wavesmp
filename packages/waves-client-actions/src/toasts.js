const types = require('waves-action-types')

const DEFAULT_TIMEOUT = 3000

let id = 0

function toastRemove(id) {
  return { type: types.TOAST_REMOVE, id }
}

function toastAdd(toast) {
  return dispatch => {
    toast.id = ++id
    dispatch({ type: types.TOAST_ADD, toast })
    setTimeout(
      () => dispatch(toastRemove(toast.id)),
      toast.timeout || DEFAULT_TIMEOUT
    )
  }
}

module.exports.toastAdd = toastAdd
module.exports.toastRemove = toastRemove
