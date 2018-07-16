const actionTypes = require('waves-action-types')

const initialState = false

function transitions(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TRANSITION_MAIN_SET:
      return action.on
    default:
      return state
  }
}

module.exports = transitions
