import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";
import type { Library } from "src/types/trackTypes";

const initialState = null;

function reducerLibrary(
  state: Library | null = initialState,
  action: ReducerAction,
): Library | null {
  switch (action.type) {
    case actionTypes.TRACKS_ADD:
      return action.lib;
    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action;
      return Object.fromEntries(
        Object.entries(state ?? {}).filter(([id]) => !deleteIds.has(id)),
      );
    }
    case actionTypes.TRACKS_INFO_UPDATE: {
      const { ids } = action;
      const library = { ...state };
      for (const id of ids) {
        const track = library[id];
        /* Only tracks in the library are updated */
        if (track) {
          library[id] = { ...track, [action.key]: action.value };
        }
      }
      return library;
    }
    default:
      return state;
  }
}

export { reducerLibrary };
