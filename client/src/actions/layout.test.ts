import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import * as actions from "./layout";

describe("#layout()", () => {
  it("#layout()", () => {
    assert.isDefined(actionTypes.LAYOUT_SET);
    const layout = 2;
    const expectedAction = { type: actionTypes.LAYOUT_SET, layout };
    assert.deepEqual(actions.layoutSet(layout), expectedAction);
  });
});
