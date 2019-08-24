const actionTypes = require('waves-action-types')

/* Controls the layout
 * - 0: < 516px
 * - 1: < 768px
 * - 2: anything greater */
const initialState = 0

function layout(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LAYOUT_SET:
      return action.layout
    default:
      return state
  }
}

module.exports = layout
