import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import type { Toast } from "src/types/stateTypes";

import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";
import {
  TEST_TOAST1 as toast1,
  TEST_TOAST2 as toast2,
} from "src/testUtil/testData";

import { toasts } from "./toasts";

describe("#toasts()", () => {
  let state: Toast[];
  let action: unknown;

  it("initial state", () => {
    state = assertNewState(toasts, undefined, UNKNOWN_ACTION);
    assert.lengthOf(state, 0);
  });

  it("add first toast", () => {
    assert.isDefined(actionTypes.TOAST_ADD);
    action = { type: actionTypes.TOAST_ADD, toast: toast1 };
    state = assertNewState(toasts, state, action);

    assert.deepEqual(state, [toast1]);
  });

  it("add second toast", () => {
    action = { type: actionTypes.TOAST_ADD, toast: toast2 };
    state = assertNewState(toasts, state, action);

    assert.deepEqual(state, [toast1, toast2]);
  });

  it("remove toast", () => {
    assert.isDefined(actionTypes.TOAST_REMOVE);
    action = { type: actionTypes.TOAST_REMOVE, id: toast1.id };
    state = assertNewState(toasts, state, action);
    assert.deepEqual(state, [toast2]);
  });
});
