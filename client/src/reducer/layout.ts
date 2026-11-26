import { actionTypes } from "src/actionTypes";
import type { ReducerAction } from "src/types/actionTypes";
import type { Layout } from "src/types/stateTypes";

/* Controls the layout
 * - 0: < 516px
 * - 1: < 768px
 * - 2: anything greater */
const initialState: Layout = 0;

function layout(state: Layout = initialState, action: ReducerAction): Layout {
  switch (action.type) {
    case actionTypes.LAYOUT_SET:
      return action.layout;
    default:
      return state;
  }
}

export { layout };
