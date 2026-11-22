import { actionTypes } from "src/actionTypes";

function modalSet(modal) {
  return { type: actionTypes.MODAL_SET, modal };
}

export { modalSet };
