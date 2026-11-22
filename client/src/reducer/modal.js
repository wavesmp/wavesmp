import { actionTypes } from "src/actionTypes";

const initialState = null;

function modal(state = initialState, action) {
  switch (action.type) {
    case actionTypes.MODAL_SET: {
      return action.modal;
    }
    default:
      return state;
  }
}

export { modal };
