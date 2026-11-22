import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";

import { layout } from "./layout";

describe("#layout()", () => {
  let state;
  let action;

  it("initial state", () => {
    state = assertNewState(layout, undefined, UNKNOWN_ACTION);
    assert.strictEqual(state, 0);
  });

  it("set to 1", () => {
    assert.isDefined(actionTypes.LAYOUT_SET);
    action = { type: actionTypes.LAYOUT_SET, layout: 1 };
    state = assertNewState(layout, state, action);
    assert.strictEqual(state, 1);
  });
});
