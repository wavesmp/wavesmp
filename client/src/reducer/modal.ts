import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";
import type { Modal } from "src/types/stateTypes";

const initialState: Modal | null = null;

function modal(
  state: Modal | null = initialState,
  action: ReducerAction,
): Modal | null {
  switch (action.type) {
    case actionTypes.MODAL_SET: {
      return action.modal;
    }
    default:
      return state;
  }
}

export { modal };
