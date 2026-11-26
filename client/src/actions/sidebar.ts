import { actionTypes } from "src/actionTypes";
import type { WavesAction } from "src/types/actionTypes";

function sidebarSet(
  sidebar: boolean,
): Extract<WavesAction, { type: typeof actionTypes.SIDEBAR_SET }> {
  return { type: actionTypes.SIDEBAR_SET, sidebar };
}

export { sidebarSet };
