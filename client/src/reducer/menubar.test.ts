import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";

import { menubar } from "./menubar";

describe("#menubar()", () => {
  let state: boolean;
  let action: unknown;

  it("initial state", () => {
    state = assertNewState(menubar, undefined, UNKNOWN_ACTION);
    assert.strictEqual(state, false);
  });

  it("set menubar mode", () => {
    action = { type: actionTypes.MENUBAR_SET, menubar: true };
    state = assertNewState(menubar, state, action);

    assert.strictEqual(state, true);
  });
});
