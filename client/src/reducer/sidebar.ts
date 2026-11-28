import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";

/* Controls the sidebar contents.
 * - false: main sidebar
 * - true: playlists sidebar */
const initialState = false;

function sidebar(
  state: boolean = initialState,
  action: ReducerAction,
): boolean {
  switch (action.type) {
    case actionTypes.SIDEBAR_SET:
      return action.sidebar;
    default:
      return state;
  }
}

export { sidebar };
