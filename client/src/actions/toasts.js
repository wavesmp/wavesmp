import { actionTypes } from "src/actionTypes";
import { toastTypes } from "src/constants";

const DEFAULT_TIMEOUT = 3000;

let id = 0;

function toastRemove(id) {
  return { type: actionTypes.TOAST_REMOVE, id };
}

function toastAdd(toast) {
  return (dispatch) => {
    id += 1;
    toast.id = id;
    dispatch({ type: actionTypes.TOAST_ADD, toast });
    setTimeout(
      () => dispatch(toastRemove(toast.id)),
      toast.timeout || DEFAULT_TIMEOUT,
    );
  };
}

function toastErr(msg) {
  return toastAdd({ type: toastTypes.Error, msg });
}

function toastSuccess(msg) {
  return toastAdd({ type: toastTypes.Success, msg });
}

export { toastAdd, toastErr, toastRemove, toastSuccess };
