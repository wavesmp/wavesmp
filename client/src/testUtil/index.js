import { assert } from "vitest";

function generateString(n) {
  return "c".repeat(n);
}

async function _assertThrows(fnName, fn, args, errFn, errVal, thisArg) {
  try {
    await fn.apply(thisArg, args);
    assert.isTrue(false, `Did not throw when expecting ${fnName} to fail`);
  } catch (err) {
    const actualErrVal = errFn(err);
    assert.strictEqual(actualErrVal, errVal);
  }
}

async function assertThrows(fnName, fn, args, msg, thisArg) {
  await _assertThrows(fnName, fn, args, (err) => `${err}`, msg, thisArg);
}

async function assertThrowsMessage(fnName, fn, args, msg, thisArg) {
  await _assertThrows(fnName, fn, args, (err) => err.message, msg, thisArg);
}

function assertNewState(reducer, state, action) {
  const newState = reducer(state, action);
  assert.notStrictEqual(state, newState);
  return newState;
}

const UNKNOWN_ACTION = { type: "UNKNOWN_ACTION" };

export {
  assertNewState,
  assertThrows,
  assertThrowsMessage,
  generateString,
  UNKNOWN_ACTION,
};
