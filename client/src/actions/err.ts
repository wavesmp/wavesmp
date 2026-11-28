import { actionTypes } from "src/actionTypes";
import type { WavesAction } from "src/types/actionTypes";

function err(
  err: unknown,
): Extract<WavesAction, { type: typeof actionTypes.ERR }> {
  return { type: actionTypes.ERR, err };
}

export { err };
