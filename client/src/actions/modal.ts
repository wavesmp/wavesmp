import { actionTypes } from "src/actionTypes";
import type { WavesAction } from "src/types/actionTypes";
import type { Modal } from "src/types/stateTypes";

function modalSet(
  modal: Modal | null,
): Extract<WavesAction, { type: typeof actionTypes.MODAL_SET }> {
  return { type: actionTypes.MODAL_SET, modal };
}

export { modalSet };
