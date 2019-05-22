const types = require('waves-action-types')

function err(err) {
  return { type: types.ERR, err }
}

module.exports.err = err
