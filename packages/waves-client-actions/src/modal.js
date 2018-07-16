const types = require('waves-action-types')

function modalSet(modal) {
  return { type: types.MODAL_SET, modal}
}

module.exports.modalSet = modalSet
