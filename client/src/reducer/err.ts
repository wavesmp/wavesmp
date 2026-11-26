import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";

const initialState: unknown = null;

function err(state: unknown = initialState, action: ReducerAction): unknown {
  switch (action.type) {
    case actionTypes.ERR: {
      return action.err;
    }
    default:
      return state;
  }
}

export { err };
