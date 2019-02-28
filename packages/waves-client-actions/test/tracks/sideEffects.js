const { assert } = require('chai')
const mongoid = require('mongoid-js')
const sinon = require('sinon')

const types = require('waves-action-types')
const { toastTypes } = require('waves-client-constants')
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

describe('#sideEffects()', async () => {
  it('#download()', async () => {
    const player = new Player({})

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const thunk = actions.download(track1.id)

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock
      .expects('download')
      .once()
      .withExactArgs(track1)

    const tracks = { library }
    await thunk(dispatchMock, () => ({ tracks }), { player })

    const firstDisptachCall = dispatchExpect.firstCall
    const firstCallArgs = firstDisptachCall.args
    assert.lengthOf(firstCallArgs, 1)
    const firstCallArg = firstCallArgs[0]
    assert.lengthOf(Object.keys(firstCallArg), 2)
    assert.strictEqual(firstCallArg.type, types.TOAST_ADD)
    const firstCallToast = firstCallArg.toast
    assert.lengthOf(Object.keys(firstCallToast), 3)
    assert.strictEqual(firstCallToast.type, toastTypes.Success)
    assert.strictEqual(firstCallToast.msg, 'Download started')
    assert.isNumber(firstCallToast.id)

    playerMock.verify()
    dispatchMock.verify()
  })
})
