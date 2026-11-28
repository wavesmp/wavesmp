import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";

import { sidebar } from "./sidebar";

describe("#sidebar()", () => {
  let state: boolean;
  let action: unknown;

  it("initial state", () => {
    state = assertNewState(sidebar, undefined, UNKNOWN_ACTION);
    assert.strictEqual(state, false);
  });

  it("set sidebar mode", () => {
    action = { type: actionTypes.SIDEBAR_SET, sidebar: true };
    state = assertNewState(sidebar, state, action);

    assert.strictEqual(state, true);
  });
});
