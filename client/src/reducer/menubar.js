import { actionTypes } from "src/actionTypes";

/* Controls the menubar contents
 * - false: track player
 * - true: track options */
const initialState = false;

function menubar(state = initialState, action) {
  switch (action.type) {
    case actionTypes.MENUBAR_SET:
      return action.menubar;
    default:
      return state;
  }
}

export { menubar };
