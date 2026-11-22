import { actionTypes } from "src/actionTypes";

function layoutSet(layout) {
  return { type: actionTypes.LAYOUT_SET, layout };
}

export { layoutSet };
