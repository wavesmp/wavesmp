const actionTypes = require('waves-action-types')

const initialState = null

function dropdown(state = initialState, action) {
  switch (action.type) {
    case actionTypes.DROPDOWN_SET: {
      return action.dropdown
    }
    default:
      return state
  }
}

module.exports = dropdown
