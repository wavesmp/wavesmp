const types = require('waves-action-types')

function transitionMainSet(on) {
  return { type: types.TRANSITION_SET, on }
}

module.exports.transitionMainSet = transitionMainSet
