import { actionTypes } from "src/actionTypes";
import type { WavesAction } from "src/types/actionTypes";
import type { Layout } from "src/types/stateTypes";

function layoutSet(
  layout: Layout,
): Extract<WavesAction, { type: typeof actionTypes.LAYOUT_SET }> {
  return { type: actionTypes.LAYOUT_SET, layout };
}

export { layoutSet };
