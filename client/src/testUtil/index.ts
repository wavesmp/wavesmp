import ObjectID from "bson-objectid";
import type { LocalStorage } from "node-localstorage";
import { assert } from "vitest";

import type {
  Dispatch,
  ExtraArgument,
  GetState,
  ReducerAction,
  Thunk,
} from "src/types/actionTypes";
import type { State } from "src/types/stateTypes";

/* Applies action to state, and asserts the reducer returned a new state */
function assertNewState<P, R>(
  reducer: (state: P, action: never) => R,
  state: P,
  action: unknown,
): R {
  const newState = reducer(state, action as never);
  assert.notStrictEqual<unknown>(state, newState);
  return newState;
}

/* A new track id. The server stores ObjectIds generated on the client */
function newTrackId(): string {
  return new ObjectID().toHexString();
}

/* Deletes the storage directory. Not in the LocalStorage types */
function deleteLocation(storage: LocalStorage): void {
  (storage as unknown as { _deleteLocation: () => void })._deleteLocation();
}

/* An action no reducer handles */
const UNKNOWN_ACTION = { type: "UNKNOWN_ACTION" } as unknown as ReducerAction;

/*
 * Test fixtures only set the parts of the state, actions and side effect
 * objects a test reads. These cast them to the full types
 */
function asState(state: unknown): State {
  return state as State;
}

function asAction(action: unknown): ReducerAction {
  return action as ReducerAction;
}

/* Calls a thunk with a mock dispatch, a partial state and partial side
 * effect objects */
function callThunk<R>(
  thunk: Thunk<R>,
  dispatch: unknown = () => undefined,
  getState: () => unknown = () => ({}),
  extraArgument: unknown = {},
): R {
  return thunk(
    dispatch as Dispatch,
    getState as GetState,
    extraArgument as ExtraArgument,
  );
}

export {
  asAction,
  assertNewState,
  asState,
  callThunk,
  deleteLocation,
  newTrackId,
  UNKNOWN_ACTION,
};
