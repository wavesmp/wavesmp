import { actionTypes } from "src/actionTypes";

const initialState = [];

function toasts(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOAST_ADD: {
      const { toast } = action;
      return [...state, toast];
    }
    case actionTypes.TOAST_REMOVE: {
      const { id } = action;
      return state.filter((toast) => toast.id !== id);
    }
    default:
      return state;
  }
}

export { toasts };
