const mongoid = require('mongoid-js')
const sinon = require('sinon')

const Player = require('waves-client-player')

const actions = require('../../src/tracks/sideEffects')

const { TEST_TRACK1: baseTrack1, TEST_TRACK2: baseTrack2 } = require('waves-test-data')

const track1 = {...baseTrack1, id: mongoid()}
const track2 = {...baseTrack2, id: mongoid()}
const library = {
  [track1.id]: track1,
  [track2.id]: track2
}

describe('#sideEffects()', async () => {

  it('#download()', async () => {
    const player = new Player({})

    const thunk = actions.download(track1.id)

    const playerMock = sinon.mock(player)
    const playerExpect = playerMock.expects('download')
      .once().withExactArgs(track1)

    const tracks = { library }
    thunk(undefined, () => ({ tracks }), { player })

    playerMock.verify()
  })


})
