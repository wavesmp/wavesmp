const actionTypes = require('waves-action-types')

/* Controls the sidebar contents. Supported values:
 * - main
 * - playlists
 * - settings
 */
const initialState = 'main'

function sidebar(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SIDEBAR_MODE_SET:
      return action.mode
    default:
      return state
  }
}

module.exports = sidebar
