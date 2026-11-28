import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";
import type { Toast } from "src/types/stateTypes";

const initialState: Toast[] = [];

function toasts(state: Toast[] = initialState, action: ReducerAction): Toast[] {
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
