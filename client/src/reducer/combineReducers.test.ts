import { assert, describe, it } from "vitest";

import { asAction } from "src/testUtil";
import type { ReducerAction } from "src/types/actionTypes";

import { combineReducers } from "./combineReducers";

/* Test actions, which are not app actions */
type TestAction = { type: "INCREMENT" } | { type: "SET_NAME"; name: string };

function counter(state = 0, action: ReducerAction): number {
  return (action as unknown as TestAction).type === "INCREMENT"
    ? state + 1
    : state;
}

function name(state = "", action: ReducerAction): string {
  const testAction = action as unknown as TestAction;
  return testAction.type === "SET_NAME" ? testAction.name : state;
}

describe("#combineReducers()", () => {
  const reducer = combineReducers({ counter, name });

  it("builds the initial state from each slice", () => {
    assert.deepEqual(reducer(undefined, asAction({ type: "INIT" })), {
      counter: 0,
      name: "",
    });
  });

  it("updates only the changed slice", () => {
    const state = reducer(undefined, asAction({ type: "INIT" }));
    const nextState = reducer(
      state,
      asAction({ type: "SET_NAME", name: "waves" }),
    );
    assert.notStrictEqual(nextState, state);
    assert.deepEqual(nextState, { counter: 0, name: "waves" });
  });

  it("returns the same state when no slice changes", () => {
    const state = reducer(undefined, asAction({ type: "INIT" }));
    assert.strictEqual(reducer(state, asAction({ type: "UNKNOWN" })), state);
  });
});
