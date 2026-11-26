import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";

/* Controls the menubar contents
 * - false: track player
 * - true: track options */
const initialState = false;

function menubar(
  state: boolean = initialState,
  action: ReducerAction,
): boolean {
  switch (action.type) {
    case actionTypes.MENUBAR_SET:
      return action.menubar;
    default:
      return state;
  }
}

export { menubar };
