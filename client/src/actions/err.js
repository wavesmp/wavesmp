import { actionTypes } from "src/actionTypes";

function err(err) {
  return { type: actionTypes.ERR, err };
}

export { err };
