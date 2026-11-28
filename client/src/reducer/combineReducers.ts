import type { Reducer, ReducerAction } from "src/types/actionTypes";

/*
 * Combine slice reducers into one reducer, like Redux's combineReducers.
 *
 * If no slice changes, the previous state object is returned. The providers
 * rely on this, since each slice has its own context that only updates when
 * the slice changes.
 */
function combineReducers<S extends object>(reducers: {
  [K in keyof S]: Reducer<S[K]>;
}): Reducer<S> {
  const keys = Object.keys(reducers) as (keyof S)[];
  return function combination(state, action: ReducerAction): S {
    let changed = state === undefined;
    const nextState: Partial<S> = {};
    for (const key of keys) {
      const prevSlice = state?.[key];
      const nextSlice = reducers[key](prevSlice, action);
      nextState[key] = nextSlice;
      changed = changed || nextSlice !== prevSlice;
    }
    /* Every key is set, from the reducers */
    return changed || state === undefined ? (nextState as S) : state;
  };
}

export { combineReducers };
