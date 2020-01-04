const { assert } = require('chai')
const sinon = require('sinon')

const types = require('waves-action-types')
const Player = require('waves-client-player')

const actions = require('../../src/tracks/playing')

describe('#playing()', () => {
  it('#pause()', () => {
    const player = new Player({})
    const playerMock = sinon.mock(player)
    playerMock
      .expects('pause')
      .once()
      .withExactArgs()

    const dispatchMock = sinon.mock()
    assert.isDefined(types.PLAYING_PAUSE)
    dispatchMock.once().withExactArgs({
      type: types.PLAYING_PAUSE
    })

    const thunk = actions.pause()
    thunk(dispatchMock, undefined, { player })

    dispatchMock.verify()
    playerMock.verify()
  })

  it('#play()', () => {
    const player = new Player({})
    const playerMock = sinon.mock(player)
    playerMock
      .expects('play')
      .once()
      .withExactArgs()

    const dispatchMock = sinon.mock()
    assert.isDefined(types.PLAYING_PLAY)
    dispatchMock.once().withExactArgs({
      type: types.PLAYING_PLAY
    })

    const thunk = actions.play()
    thunk(dispatchMock, null, { player })

    dispatchMock.verify()
    playerMock.verify()
  })

  it('#seek()', () => {
    const newTime = 3
    const player = new Player({})
    const playerMock = sinon.mock(player)
    playerMock
      .expects('seek')
      .once()
      .withExactArgs(newTime)

    const thunk = actions.seek(newTime)
    thunk(undefined, undefined, { player })

    playerMock.verify()
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
