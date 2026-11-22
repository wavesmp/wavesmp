import { actionTypes } from "src/actionTypes";

const initialState = null;

function err(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ERR: {
      return action.err;
    }
    default:
      return state;
  }
}

export { err };
