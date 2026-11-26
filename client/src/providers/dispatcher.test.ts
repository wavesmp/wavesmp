import { assert, describe, it } from "vitest";

import type {
  ExtraArgument,
  GetState,
  Reducer,
  ReducerAction,
  WavesAction,
} from "src/types/actionTypes";
import type { State } from "src/types/stateTypes";

import { bindActionCreators, createDispatcher } from "./dispatcher";

/* The dispatcher only depends on the reducer's semantics, so test it with a
 * counter. The casts adapt it to the app's state and action types */
function counter(state = 0, action: ReducerAction): number {
  return (action as { type: string }).type === "INCREMENT" ? state + 1 : state;
}

const counterReducer = counter as unknown as Reducer<State>;

function testAction(type: string): WavesAction {
  return { type } as unknown as WavesAction;
}

function create(extra: unknown = {}): ReturnType<typeof createDispatcher> {
  return createDispatcher(counterReducer, extra as ExtraArgument);
}

describe("#createDispatcher()", () => {
  it("starts from the reducer's initial state", () => {
    const { getState } = create();
    assert.strictEqual<unknown>(getState(), 0);
  });

  it("reduces actions synchronously and returns them", () => {
    const { dispatch, getState } = create();
    const action = testAction("INCREMENT");
    assert.strictEqual(dispatch(action), action);
    assert.strictEqual<unknown>(getState(), 1);
  });

  it("runs thunks with getState and the extra argument", async () => {
    const extra = { ws: "testWs" };
    const { dispatch } = create(extra);
    const result = await dispatch(
      async (innerDispatch, getState: GetState, arg): Promise<State> => {
        assert.strictEqual<unknown>(arg, extra);
        innerDispatch(testAction("INCREMENT"));
        /* State is updated before the next statement */
        return Promise.resolve(getState());
      },
    );
    assert.strictEqual<unknown>(result, 1);
  });

  it("notifies subscribers only when the state changes", () => {
    const { dispatch, subscribe } = create();
    const states: unknown[] = [];
    const unsubscribe = subscribe((state) => {
      states.push(state);
    });
    dispatch(testAction("UNKNOWN"));
    dispatch(testAction("INCREMENT"));
    unsubscribe();
    dispatch(testAction("INCREMENT"));
    assert.deepEqual(states, [1]);
  });
});

describe("#bindActionCreators()", () => {
  it("dispatches the result of each action creator", () => {
    const { dispatch, getState } = create();
    const actionCreators = {
      increment: (): WavesAction => testAction("INCREMENT"),
      notAFunction: 1,
    };
    const actions = bindActionCreators(
      actionCreators as unknown as Parameters<typeof bindActionCreators>[0],
      dispatch,
    ) as unknown as { increment: () => void };
    actions.increment();
    assert.strictEqual<unknown>(getState(), 1);
    assert.notProperty(actions, "notAFunction");
  });
});
