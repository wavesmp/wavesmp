import { assert, describe, it } from "vitest";

import { bindActionCreators, createDispatcher } from "./dispatcher";

function counter(state = 0, action) {
  return action.type === "INCREMENT" ? state + 1 : state;
}

describe("#createDispatcher()", () => {
  it("starts from the reducer's initial state", () => {
    const { getState } = createDispatcher(counter);
    assert.strictEqual(getState(), 0);
  });

  it("reduces actions synchronously and returns them", () => {
    const { dispatch, getState } = createDispatcher(counter);
    const action = { type: "INCREMENT" };
    assert.strictEqual(dispatch(action), action);
    assert.strictEqual(getState(), 1);
  });

  it("runs thunks with getState and the extra argument", async () => {
    const extra = { ws: "testWs" };
    const { dispatch } = createDispatcher(counter, extra);
    const result = await dispatch(async (innerDispatch, getState, arg) => {
      assert.strictEqual(arg, extra);
      innerDispatch({ type: "INCREMENT" });
      /* State is updated before the next statement */
      return getState();
    });
    assert.strictEqual(result, 1);
  });

  it("notifies subscribers only when the state changes", () => {
    const { dispatch, subscribe } = createDispatcher(counter);
    const states = [];
    const unsubscribe = subscribe((state) => states.push(state));
    dispatch({ type: "UNKNOWN" });
    dispatch({ type: "INCREMENT" });
    unsubscribe();
    dispatch({ type: "INCREMENT" });
    assert.deepEqual(states, [1]);
  });
});

describe("#bindActionCreators()", () => {
  it("dispatches the result of each action creator", () => {
    const { dispatch, getState } = createDispatcher(counter);
    const actions = bindActionCreators(
      { increment: () => ({ type: "INCREMENT" }), notAFunction: 1 },
      dispatch,
    );
    actions.increment();
    assert.strictEqual(getState(), 1);
    assert.notProperty(actions, "notAFunction");
  });
});
