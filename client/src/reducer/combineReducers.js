/*
 * Combine slice reducers into one reducer, like Redux's combineReducers.
 *
 * If no slice changes, the previous state object is returned. The providers
 * rely on this, since each slice has its own context that only updates when
 * the slice changes.
 */
function combineReducers(reducers) {
  const keys = Object.keys(reducers);
  return function combination(state = {}, action) {
    let changed = false;
    const nextState = {};
    for (const key of keys) {
      const prevSlice = state[key];
      const nextSlice = reducers[key](prevSlice, action);
      nextState[key] = nextSlice;
      changed = changed || nextSlice !== prevSlice;
    }
    return changed ? nextState : state;
  };
}

export { combineReducers };
