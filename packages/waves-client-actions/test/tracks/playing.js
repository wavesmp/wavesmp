const { assert } = require('chai')
const sinon = require('sinon')

const types = require('waves-action-types')
const Player = require('waves-client-player')

const actions = require('../../src/tracks/playing')

describe('#playing()', () => {

  it('#pause()', () => {
    const player = new Player({})

    const thunk = actions.pause()

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('pause').once().withExactArgs()

    const elapsed = 5000 // 5 seconds ago
    const startDate = new Date() - elapsed
    const playing = { startDate }
    const tracks = { playing }
    thunk(dispatchMock, () => ({ tracks }), { player })

    dispatchMock.verify()
    playerMock.verify()

    const dispatchCall = dispatchExpect.firstCall
    const dispatchArgs = dispatchCall.args
    assert.lengthOf(dispatchArgs, 1)
    const dispatchArg = dispatchArgs[0]
    assert.lengthOf(Object.keys(dispatchArg), 2)
    assert.isDefined(types.PLAYING_PAUSE)
    assert.strictEqual(types.PLAYING_PAUSE, dispatchArg.type)

    const buffer = 100 // 0.1s
    assert.closeTo(dispatchArg.elapsed, elapsed, buffer)
  })

  it('#play()', () => {
    const player = new Player({})

    const thunk = actions.play()

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('play').once().withExactArgs()

    const elapsed = 5000 // 5s
    const playing = { elapsed }
    const tracks = { playing }
    thunk(dispatchMock, () => ({ tracks }), { player })

    dispatchMock.verify()
    playerMock.verify()

    const dispatchCall = dispatchExpect.firstCall
    const dispatchArgs = dispatchCall.args
    assert.lengthOf(dispatchArgs, 1)
    const dispatchArg = dispatchArgs[0]
    assert.lengthOf(Object.keys(dispatchArg), 2)
    assert.isDefined(types.PLAYING_PLAY)
    assert.strictEqual(types.PLAYING_PLAY, dispatchArg.type)

    const buffer = 100 // 0.1s
    assert.closeTo(dispatchArg.startDate, new Date() - elapsed, buffer)
  })

  it('#seek()', () => {
    const pos = 0.5
    const duration = 60
    const elapsed = pos * duration
    const expectedStartDate = new Date() - elapsed * 1000

    const player = new Player({})

    const thunk = actions.seek(pos, duration)

    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once()

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('seek').once().withExactArgs(elapsed)

    thunk(dispatchMock, undefined, { player })

    dispatchMock.verify()
    playerMock.verify()

    const dispatchCall = dispatchExpect.firstCall
    const dispatchArgs = dispatchCall.args
    assert.lengthOf(dispatchArgs, 1)
    const dispatchArg = dispatchArgs[0]
    assert.lengthOf(Object.keys(dispatchArg), 2)
    assert.isDefined(types.PLAYING_SEEK)
    assert.strictEqual(types.PLAYING_SEEK, dispatchArg.type)

    const buffer = 100 // 0.1s
    assert.closeTo(dispatchArg.startDate, expectedStartDate, buffer)
  })

  it('#repeatToggle()', () => {
    assert.isDefined(types.PLAYING_REPEAT_TOGGLE)
    const action = { type: types.PLAYING_REPEAT_TOGGLE }
    assert.deepEqual(actions.repeatToggle(), action)
  })

  it('#shuffleToggle()', () => {
    assert.isDefined(types.PLAYING_SHUFFLE_TOGGLE)
    const action = { type: types.PLAYING_SHUFFLE_TOGGLE }
    assert.deepEqual(actions.shuffleToggle(), action)
  })

})
