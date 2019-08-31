const types = require('waves-action-types')
const { toastTypes } = require('waves-client-constants')

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

function toastErr(msg) {
  return toastAdd({ type: toastTypes.Error, msg })
}

function toastSuccess(msg) {
  return toastAdd({ type: toastTypes.Success, msg })
}

module.exports.toastErr = toastErr
module.exports.toastSuccess = toastSuccess
module.exports.toastAdd = toastAdd
module.exports.toastRemove = toastRemove
