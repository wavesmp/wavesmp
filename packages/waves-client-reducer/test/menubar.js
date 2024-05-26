const { assert } = require("chai");

const actionTypes = require("waves-action-types");

const { assertNewState, UNKNOWN_ACTION } = require("waves-test-util");

const menubar = require("../src/menubar");

describe("#menubar()", () => {
  let state;
  let action;

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
