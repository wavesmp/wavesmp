const { assert } = require('chai')

function generateString(n) {
  return 'c'.repeat(n)
}

async function _assertThrows(fnName, fn, args, errFn, errVal, thisArg) {
  try {
    await fn.apply(thisArg, args)
    assert.isTrue(false,
      `Did not throw when expecting ${fnName} to fail`)
  } catch (err) {
    const actualErrVal = errFn(err)
    assert.strictEqual(actualErrVal, errVal)
  }
}

async function assertThrows(fnName, fn, args, msg, thisArg) {
  await _assertThrows(fnName, fn, args, err => err.toString(), msg, thisArg)
}

async function assertThrowsMessage(fnName, fn, args, msg, thisArg) {
  await _assertThrows(fnName, fn, args, err => err.message, msg)
}

function assertNewState(reducer, state, action) {
  const newState = reducer(state, action)
  assert.notStrictEqual(state, newState)
  return newState
}

module.exports.generateString = generateString
module.exports.assertThrows = assertThrows
module.exports.assertThrowsMessage = assertThrowsMessage
module.exports.assertNewState = assertNewState
module.exports.UNKNOWN_ACTION = {type: 'UNKNOWN_ACTION'}
