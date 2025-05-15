const { assert } = require("chai");

const actionTypes = require("waves-action-types");

const { assertNewState, UNKNOWN_ACTION } = require("waves-test-util");
const { TEST_MODAL1: modal1 } = require("waves-test-data");

const modal = require("../src/modal");

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
