/*
 * Holds the app state and applies actions to it, with the same semantics the
 * actions were written for (previously Redux with redux-thunk):
 *
 * - dispatch(action) reduces the state synchronously, so getState() inside a
 *   thunk sees the result of an earlier dispatch right away
 * - dispatch(thunk) calls thunk(dispatch, getState, extraArgument) and returns
 *   its result (e.g. a promise)
 *
 * The provider subscribes to publish each new state to React.
 */
import type * as WavesActions from "src/actions";
import type {
  Dispatch,
  ExtraArgument,
  InitAction,
  Reducer,
  Thunk,
  WavesAction,
} from "src/types/actionTypes";
import type { State } from "src/types/stateTypes";

const INIT_ACTION: InitAction = { type: "@@waves/INIT" };

type Listener = (state: State) => void;

interface Dispatcher {
  dispatch: Dispatch;
  getState: () => State;
  subscribe: (listener: Listener) => () => void;
}

function createDispatcher(
  reducer: Reducer<State>,
  extraArgument: ExtraArgument,
): Dispatcher {
  let state = reducer(undefined, INIT_ACTION);
  const listeners = new Set<Listener>();

  function getState(): State {
    return state;
  }

  function dispatchAction(action: WavesAction | Thunk<unknown>): unknown {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }
    const nextState = reducer(state, action);
    if (nextState !== state) {
      state = nextState;
      for (const listener of listeners) {
        listener(state);
      }
    }
    return action;
  }
  /* Overloads: an action returns itself, a thunk returns its result */
  const dispatch: Dispatch = dispatchAction;

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { dispatch, getState, subscribe };
}

/* Dispatching an action creator's result returns the action, or the
 * thunk's result */
type Dispatched<T> = T extends Thunk<infer R> ? R : T;

type ActionCreators = typeof WavesActions;

/* The action creators, bound to dispatch */
type BoundActions = {
  [K in keyof ActionCreators]: ActionCreators[K] extends (
    ...args: infer A
  ) => infer T
    ? (...args: A) => Dispatched<T>
    : never;
};

/* Wrap each action creator so calling it dispatches its result */
function bindActionCreators(
  actionCreators: ActionCreators,
  dispatch: Dispatch,
): BoundActions {
  const bound: Record<string, (...args: never[]) => unknown> = {};
  for (const [name, actionCreator] of Object.entries(actionCreators)) {
    if (typeof actionCreator === "function") {
      bound[name] = (...args: never[]): unknown =>
        dispatch(
          (actionCreator as (...a: never[]) => WavesAction | Thunk<unknown>)(
            ...args,
          ) as never,
        );
    }
  }
  /* Every action creator is bound above */
  return bound as BoundActions;
}

export { bindActionCreators, createDispatcher };
export type { BoundActions, Dispatcher };
