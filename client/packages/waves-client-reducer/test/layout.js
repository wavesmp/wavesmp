const { assert } = require("chai");

const actionTypes = require("waves-action-types");

const { assertNewState, UNKNOWN_ACTION } = require("waves-test-util");

const layout = require("../src/layout");

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
