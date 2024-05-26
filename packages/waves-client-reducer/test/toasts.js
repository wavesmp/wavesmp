const { assert } = require("chai");

const actionTypes = require("waves-action-types");

const { assertNewState, UNKNOWN_ACTION } = require("waves-test-util");
const { TEST_TOAST1: toast1, TEST_TOAST2: toast2 } = require("waves-test-data");

const toasts = require("../src/toasts");

describe("#toasts()", () => {
  let state;
  let action;

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
