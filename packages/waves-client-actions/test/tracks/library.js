const { assert } = require('chai')
const mongoid = require('mongoid-js')
const sinon = require('sinon')

const types = require('waves-action-types')
const { TEST_TRACK1: baseTrack1, TEST_TRACK2: baseTrack2 } = require('waves-test-data')
const WavesSocket = require('waves-socket')

const actions = require('../../src/tracks/library')

const track1 = {...baseTrack1, id: mongoid()}
const track2 = {...baseTrack2, id: mongoid()}


describe('#library()', () => {

  it('track info update', () => {
    const ws = new WavesSocket({})

    const id = track1.id
    const attr = 'title'
    const update = 'newTitle'
    const action = {type: types.LIBRARY_TRACK_UPDATE, id, attr, update}
    const thunk = actions.libraryInfoUpdate(id, attr, update)

    assert.isDefined(types.LIBRARY_TRACK_UPDATE)
    const dispatchMock = sinon.mock()
    const dispatchExpect = dispatchMock.once().withExactArgs(action)

    const wsMock = sinon.mock(ws)
    const wsExpect = wsMock.expects('sendBestEffortMessage')
      .once()
      .withExactArgs(types.LIBRARY_TRACK_UPDATE,
        {id, attr, update})

    thunk(dispatchMock, undefined, { ws })

    dispatchMock.verify()
    wsMock.verify()

  })

})
