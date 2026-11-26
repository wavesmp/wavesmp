import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";
import type { Menu } from "src/types/stateTypes";

/* State is list of objects describing a menu. e.g.
 * [
 *   {
 *     type - describes the type of menu. Maps to a component
 *     x - left coordinate of menu
 *     y - top coordinate of menu
 *     props - props passed to the menu component
 *   }
 * ]
 */
const initialState: Menu[] = [];

function menu(state: Menu[] = initialState, action: ReducerAction): Menu[] {
  switch (action.type) {
    case actionTypes.MENU_RESET: {
      return [];
    }
    case actionTypes.MENU_SET: {
      const { menu } = action;
      return [menu];
    }
    // Menu set must be called before this
    case actionTypes.MENU_NEXT: {
      const { menu } = action;
      const numMenus = state.length;
      const oldMenu = state[numMenus - 1];
      if (!oldMenu) {
        throw new Error("A menu must be set before the next menu");
      }
      menu.transform = oldMenu.transform;
      return [...state, menu];
    }
    // Menu next should be called before this
    case actionTypes.MENU_BACK: {
      const newState = [...state];
      newState.pop();
      return newState;
    }
    default:
      return state;
  }
}

export { menu };
