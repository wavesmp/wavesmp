import { assert, describe, it } from "vitest";

import { combineReducers } from "./combineReducers";

function counter(state = 0, action) {
  return action.type === "INCREMENT" ? state + 1 : state;
}

function name(state = "", action) {
  return action.type === "SET_NAME" ? action.name : state;
}

describe("#combineReducers()", () => {
  const reducer = combineReducers({ counter, name });

  it("builds the initial state from each slice", () => {
    assert.deepEqual(reducer(undefined, { type: "INIT" }), {
      counter: 0,
      name: "",
    });
  });

  it("updates only the changed slice", () => {
    const state = reducer(undefined, { type: "INIT" });
    const nextState = reducer(state, { type: "SET_NAME", name: "waves" });
    assert.notStrictEqual(nextState, state);
    assert.deepEqual(nextState, { counter: 0, name: "waves" });
  });

  it("returns the same state when no slice changes", () => {
    const state = reducer(undefined, { type: "INIT" });
    assert.strictEqual(reducer(state, { type: "UNKNOWN" }), state);
  });
});
