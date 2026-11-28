import type { ReducerAction } from "src/types/actionTypes";
import type { Libraries } from "src/types/trackTypes";

import { reducerLibrary } from "./library";

const initialState: Libraries = {};

/* Actions with a libName update that library */
function reducerLibraries(
  state: Libraries = initialState,
  action: ReducerAction,
): Libraries {
  if ("libName" in action && action.libName) {
    const { libName } = action;
    return { ...state, [libName]: reducerLibrary(state[libName], action) };
  }
  return state;
}

export { reducerLibraries };
