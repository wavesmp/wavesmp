const { assert } = require('chai')
const { LocalStorage } = require('node-localstorage')
const sinon = require('sinon')

const types = require('waves-action-types')
const Auth = require('waves-client-auth')
const LocalState = require('waves-client-local-state')
const Player = require('waves-client-player')
const WavesSocket = require('waves-socket')
const {
  TEST_USER1: testUser,
  TEST_TOKEN: testToken,
  TEST_IDP: testIdp
} = require('waves-test-data')

const actions = require('../src/account')

const LOCAL_STORAGE_PATH = './node-localstorage-cache'

describe('#account()', () => {
  it('#accountSetFetchingUser()', () => {
    const fetchingUser = false
    assert.isDefined(types.ACCOUNT_SET_FETCHING_USER)
    const expectedAction = {
      type: types.ACCOUNT_SET_FETCHING_USER,
      fetchingUser
    }
    assert.deepEqual(
      actions.accountSetFetchingUser(fetchingUser),
      expectedAction
    )
  })

  it('#accountSetSettings()', () => {
    const mockDoc = { documentElement: {} }
    global.document = mockDoc

    const localStorage = new LocalStorage(LOCAL_STORAGE_PATH)
    const localState = new LocalState(localStorage)

    const columns = new Set(['title', 'artist', 'genre'])
    const rowsPerPage = 25
    const theme = 'testTheme'
    const thunk = actions.accountSetSettings({ columns, rowsPerPage, theme })

    const action = {
      type: types.ACCOUNT_SET_SETTINGS,
      settings: { columns, rowsPerPage, theme }
    }

    const dispatchMock = sinon.mock()
    dispatchMock.once().withExactArgs(action)

    const localStateMock = sinon.mock(localState)
    const localStateExpect = localStateMock.expects('setItem').thrice()

    thunk(dispatchMock, undefined, { localState })

    const firstLocalStateCall = localStateExpect.firstCall
    assert.isTrue(
      firstLocalStateCall.calledWithExactly('columns', [...columns])
    )

    const secondLocalStateCall = localStateExpect.secondCall
    assert.isTrue(
      secondLocalStateCall.calledWithExactly('rowsPerPage', rowsPerPage)
    )

    const thirdLocalStateCall = localStateExpect.thirdCall
    assert.isTrue(thirdLocalStateCall.calledWithExactly('theme', theme))

    assert.strictEqual(mockDoc.documentElement.className, 'theme-testTheme')

    dispatchMock.verify()
    localStateMock.verify()
    localStorage._deleteLocation()
  })

  it('#signOut()', async () => {
    const ws = new WavesSocket(() => ({}))
    const auth = new Auth({})
    const localStorage = new LocalStorage(LOCAL_STORAGE_PATH)
    const localState = new LocalState(localStorage)

    const thunk = actions.signOut()

    const action = { type: types.ACCOUNT_LOGIN, user: null }

    const dispatchMock = sinon.mock()
    dispatchMock.once().withExactArgs(action)

    const authMock = sinon.mock(auth)
    authMock
      .expects('signOut')
      .once()
      .withExactArgs(testIdp)

    const localStateMock = sinon.mock(localState)
    localStateMock
      .expects('getItem')
      .once()
      .withExactArgs('lastIdp')
      .returns(testIdp)
    localStateMock
      .expects('setItem')
      .once()
      .withExactArgs('lastIdp', '')

    const wsMock = sinon.mock(ws)
    wsMock
      .expects('setOnConnect')
      .once()
      .withExactArgs(null)

    await thunk(dispatchMock, undefined, { auth, ws, localState })

    dispatchMock.verify()
    authMock.verify()
    localStateMock.verify()
    localStorage._deleteLocation()
    wsMock.verify()
  })

  it('sign in auth not verified', async () => {
    const ws = new WavesSocket(() => ({}))
    const auth = new Auth({})

    const thunk = actions.signIn(testIdp)

    const authMock = sinon.mock(auth)
    authMock
      .expects('signIn')
      .once()
      .withExactArgs(testIdp)
    authMock
      .expects('tryAutoLogin')
      .once()
      .withExactArgs(testIdp)
      .returns(testToken)

    const wsMock = sinon.mock(ws)
    const loginErr = new Error('Waves internal server error')
    wsMock
      .expects('sendAckedMessage')
      .once()
      .withExactArgs(types.ACCOUNT_LOGIN, { token: testToken, idp: testIdp })
      .rejects(loginErr)

    try {
      await thunk(undefined, undefined, { auth, ws })
      assert.fail('Expected sign in to throw')
    } catch (err) {
      assert.strictEqual(err, loginErr)
    }

    authMock.verify()
    wsMock.verify()
  })

  it('sign in successful', async () => {
    const ws = new WavesSocket(() => ({}))
    const auth = new Auth({})
    const localStorage = new LocalStorage(LOCAL_STORAGE_PATH)
    const localState = new LocalState(localStorage)
    const player = new Player({})

    const thunk = actions.signIn(testIdp)

    const action = { type: types.ACCOUNT_LOGIN, user: testUser }

    const dispatchMock = sinon.mock()
    dispatchMock.once().withExactArgs(action)

    const authMock = sinon.mock(auth)
    authMock
      .expects('signIn')
      .once()
      .withExactArgs(testIdp)
    authMock
      .expects('tryAutoLogin')
      .once()
      .withExactArgs(testIdp)
      .returns(testToken)

    const localStateMock = sinon.mock(localState)
    localStateMock
      .expects('setItem')
      .once()
      .withExactArgs('lastIdp', testIdp)

    const wsMock = sinon.mock(ws)
    wsMock
      .expects('sendAckedMessage')
      .once()
      .withExactArgs(types.ACCOUNT_LOGIN, { token: testToken, idp: testIdp })
      .resolves(testUser)

    const playerMock = sinon.mock(player)
    playerMock
      .expects('login')
      .once()
      .withExactArgs(testIdp, testUser.idpId, testToken)

    await thunk(dispatchMock, undefined, { auth, player, localState, ws })

    dispatchMock.verify()
    authMock.verify()
    wsMock.verify()
    playerMock.verify()
    localStateMock.verify()

    localStorage._deleteLocation()
  })
})
