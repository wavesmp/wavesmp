import { actionTypes } from "src/actionTypes";
import { TOAST_TIMEOUT, toastTypes } from "src/constants";
import type { Thunk, WavesAction } from "src/types/actionTypes";
import type { Toast } from "src/types/stateTypes";

let id = 0;

function toastRemove(
  toastId: number,
): Extract<WavesAction, { type: typeof actionTypes.TOAST_REMOVE }> {
  return { type: actionTypes.TOAST_REMOVE, id: toastId };
}

function toastAdd(toast: Toast): Thunk<void> {
  return (dispatch) => {
    id += 1;
    const toastId = id;
    toast.id = toastId;
    dispatch({ type: actionTypes.TOAST_ADD, toast });
    setTimeout(
      () => dispatch(toastRemove(toastId)),
      toast.timeout ?? TOAST_TIMEOUT,
    );
  };
}

function toastErr(msg: string): Thunk<void> {
  return toastAdd({ type: toastTypes.Error, msg });
}

function toastSuccess(msg: string): Thunk<void> {
  return toastAdd({ type: toastTypes.Success, msg });
}

export { toastAdd, toastErr, toastRemove, toastSuccess };
