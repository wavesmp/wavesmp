import { actionTypes } from "src/actionTypes";
import type { WavesAction } from "src/types/actionTypes";

function menubarSet(
  menubar: boolean,
): Extract<WavesAction, { type: typeof actionTypes.MENUBAR_SET }> {
  return { type: actionTypes.MENUBAR_SET, menubar };
}

export { menubarSet };
