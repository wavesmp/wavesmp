import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";
import { TEST_MODAL1 as modal1 } from "src/testUtil/testData.json";

import { modal } from "./modal";

describe("#modal()", () => {
  let state;
  let action;

  it("initial state", () => {
    state = assertNewState(modal, undefined, UNKNOWN_ACTION);
    assert.isNull(state);
  });

  it("set to modal", () => {
    action = { type: actionTypes.MODAL_SET, modal: modal1 };
    state = assertNewState(modal, state, action);

    assert.strictEqual(state, modal1);
  });

  it("set to null", () => {
    action = { type: actionTypes.MODAL_SET, modal: null };
    state = assertNewState(modal, state, action);

    assert.isNull(state);
  });
});
