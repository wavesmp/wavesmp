const { assert } = require('chai')
const mongoid = require('mongoid-js')
const sinon = require('sinon')

const types = require('waves-action-types')
const { LIBRARY_NAME, toastTypes } = require('waves-client-constants')
const Player = require('waves-client-player')

const actions = require('../../src/tracks/sideEffects')

const {
  TEST_TRACK1: baseTrack1,
  TEST_TRACK2: baseTrack2
} = require('waves-test-data')

const track1 = { ...baseTrack1, id: mongoid() }
const track2 = { ...baseTrack2, id: mongoid() }
const library = {
  [track1.id]: track1,
  [track2.id]: track2
}
const libraries = {
  [LIBRARY_NAME]: library
}

describe('#sideEffects()', async () => {
  it('#download()', async () => {
    const player = new Player({})

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.twice()

    const thunk = actions.download(track1.id)

    const playerMock = sinon.mock(player)
    playerMock
      .expects('download')
      .once()
      .withExactArgs(track1)

    const tracks = { libraries }
    await thunk(dispatchMock, () => ({ tracks }), { player })

    const firstDisptachCall = dispatchExpect.firstCall
    const firstCallArgs = firstDisptachCall.args
    assert.lengthOf(firstCallArgs, 1)
    const firstCallArg = firstCallArgs[0]
    firstCallArg(dispatchMock)

    const secondDispatchCall = dispatchExpect.secondCall
    const secondCallArgs = secondDispatchCall.args
    assert.lengthOf(secondCallArgs, 1)
    const secondCallArg = secondCallArgs[0]
    assert.lengthOf(Object.keys(secondCallArg), 2)
    assert.strictEqual(secondCallArg.type, types.TOAST_ADD)
    const secondCallToast = secondCallArg.toast
    assert.lengthOf(Object.keys(secondCallToast), 3)
    assert.strictEqual(secondCallToast.type, toastTypes.Success)
    assert.strictEqual(secondCallToast.msg, 'Download started')
    assert.isNumber(secondCallToast.id)

    playerMock.verify()
    dispatchMock.verify()
  })
})
