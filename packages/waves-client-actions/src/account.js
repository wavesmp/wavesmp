const types = require('waves-action-types')

function accountSetFetchingUser(fetchingUser) {
  return { type: types.ACCOUNT_SET_FETCHING_USER, fetchingUser }
}

function accountSetSettings(settings) {
  const { theme } = settings
  if (theme) {
    document.documentElement.className = `theme-${theme}`
  }
  return (dispatch, getState, { localState }) => {
    dispatch({ type: types.ACCOUNT_SET_SETTINGS, settings })
    for (const settingKey in settings) {
      const settingVal = settings[settingKey]
      if (settingKey === 'columns') {
        /* Setting must by JSON serializable */
        localState.setItem('columns', [...settingVal])
      } else {
        localState.setItem(settingKey, settingVal)
      }
    }
  }
}

function signOut() {
  return async (dispatch, getState, { auth, localState, ws }) => {
    const lastIdp = await localState.getItem('lastIdp')
    await auth.signOut(lastIdp)
    await localState.setItem('lastIdp', '')
    dispatch({ type: types.ACCOUNT_LOGIN, user: null })
    ws.setOnConnect(null)
  }
}

function signIn(idp) {
  return async (dispatch, getState, { auth, player, ws, localState }) => {
    await auth.signIn(idp)
    const user = await _tryAutoLogin(dispatch, idp, auth, player, ws)
    localState.setItem('lastIdp', idp)
    return user
  }
}

function retryLoginOnConnect(idp) {
  return async (dispatch, getState, { ws }) => {
    ws.setOnConnect(async () => {
      try {
        await dispatch(tryAutoLogin(idp))
        console.log('Authenticated after reconnect')
      } catch (err) {
        console.log('Failed to authenticate after reconnect')
        console.log(err)
      }
    })
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
    /* Not logged in */
    dispatch({ type: types.ACCOUNT_LOGIN, user: null })
    return
  }
  const { token } = authResp

  const user = await ws.sendAckedMessage(types.ACCOUNT_LOGIN, { token, idp })
  player.login(idp, user.idpId, token)
  dispatch({ type: types.ACCOUNT_LOGIN, user })
  return user
}

module.exports.accountSetFetchingUser = accountSetFetchingUser
module.exports.accountSetSettings = accountSetSettings
module.exports.signOut = signOut
module.exports.signIn = signIn
module.exports.tryAutoLogin = tryAutoLogin
module.exports.retryLoginOnConnect = retryLoginOnConnect
