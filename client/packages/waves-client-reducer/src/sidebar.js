const actionTypes = require("waves-action-types");

/* Controls the sidebar contents.
 * - false: main sidebar
 * - true: playlists sidebar */
const initialState = false;

function sidebar(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SIDEBAR_SET:
      return action.sidebar;
    default:
      return state;
  }
}

module.exports = sidebar;
