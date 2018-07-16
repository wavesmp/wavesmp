const types = require('waves-action-types')

function accountSetFetchingUser(fetchingUser) {
  return { type: types.ACCOUNT_SET_FETCHING_USER, fetchingUser }
}

function accountSetSettings(columns, rowsPerPage) {
  return (dispatch, getState, { localState }) => {
    dispatch({ type: types.ACCOUNT_SET_SETTINGS, columns, rowsPerPage })
    localState.setItem('columns', [...columns.keys()])
    localState.setItem('rowsPerPage', rowsPerPage)
  }
}

function signOut() {
  return async (dispatch, getState, { auth, localState }) => {
    const lastIdp = await localState.getItem('lastIdp')
    await auth.signOut(lastIdp)
    await localState.setItem('lastIdp', '')
    dispatch({ type: types.ACCOUNT_LOGIN, user: null})
  }
}

function signIn(idp) {
  return async (dispatch, getState, { auth, player, ws, localState }) => {
    await auth.signIn(idp)
    const user = await _tryAutoLogin(dispatch, idp, auth, player, ws)
    if (user) {
      localState.setItem('lastIdp', idp)
    }
  }
}

function tryAutoLogin(idp) {
  return async (dispatch, getState, { auth, player, ws }) => {
    await _tryAutoLogin(dispatch, idp, auth, player, ws)
  }
}

async function _tryAutoLogin(dispatch, idp, auth, player, ws) {
  const authResp = await auth.tryAutoLogin(idp)
  if (!authResp) {
    dispatch({ type: types.ACCOUNT_LOGIN, user: null})
    return
  }
  const { token } = authResp

  let user
  try {
    user = await ws.sendAckedMessage(types.ACCOUNT_LOGIN, {token, idp})
  } catch (err) {
    // TODO need a plan for bubbling up action errors
    console.log(`Error logging into waves server: ${err}`)
    user = null
  }
  if (!user) {
    dispatch({ type: types.ACCOUNT_LOGIN, user: null})
    return
  }
  player.login(idp, user.idpId, token)
  dispatch({ type: types.ACCOUNT_LOGIN, user})
  return user
}

module.exports.accountSetFetchingUser = accountSetFetchingUser
module.exports.accountSetSettings = accountSetSettings
module.exports.signOut = signOut
module.exports.signIn = signIn
module.exports.tryAutoLogin = tryAutoLogin
