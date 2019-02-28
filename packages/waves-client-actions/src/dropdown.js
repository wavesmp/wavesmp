const types = require('waves-action-types')

function dropdownSet(dropdown) {
  return { type: types.DROPDOWN_SET, dropdown }
}

module.exports.dropdownSet = dropdownSet
