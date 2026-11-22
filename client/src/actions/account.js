import { actionTypes } from "src/actionTypes";

function accountSetFetchingUser(fetchingUser) {
  return { type: actionTypes.ACCOUNT_SET_FETCHING_USER, fetchingUser };
}

function accountSetSettings(settings) {
  const { theme } = settings;
  if (theme) {
    document.documentElement.className = `theme-${theme}`;
  }
  return (dispatch, getState, { localState }) => {
    dispatch({ type: actionTypes.ACCOUNT_SET_SETTINGS, settings });
    for (const settingKey in settings) {
      const settingVal = settings[settingKey];
      if (settingKey === "columns") {
        /* Setting must by JSON serializable */
        localState.setItem("columns", [...settingVal]);
      } else {
        localState.setItem(settingKey, settingVal);
      }
    }
  };
}

function signOut() {
  return async (dispatch, getState, { auth, localState, ws }) => {
    const lastIdp = await localState.getItem("lastIdp");
    await auth.signOut(lastIdp);
    await localState.setItem("lastIdp", "");
    dispatch({ type: actionTypes.ACCOUNT_LOGIN, user: null });
    ws.setOnConnect(null);
  };
}

function signIn(idp) {
  return async (dispatch, getState, { auth, player, ws, localState }) => {
    await auth.signIn(idp);
    await _tryAutoLogin(dispatch, idp, auth, player, ws);
    localState.setItem("lastIdp", idp);
  };
}

function renderSignInButton(idp, element, onSignIn) {
  return (dispatch, getState, { auth }) => {
    auth.renderButton(idp, element, onSignIn);
  };
}

function retryLoginOnConnect(idp) {
  return async (dispatch, getState, { ws }) => {
    ws.setOnConnect(async () => {
      try {
        await dispatch(tryAutoLogin(idp));
        console.log("Authenticated after reconnect");
      } catch (err) {
        console.log("Failed to authenticate after reconnect");
        console.log(err);
      }
    });
  };
}

function tryAutoLogin(idp) {
  return async (dispatch, getState, { auth, player, ws }) => {
    await _tryAutoLogin(dispatch, idp, auth, player, ws);
  };
}

async function _tryAutoLogin(dispatch, idp, auth, player, ws) {
  const token = await auth.tryAutoLogin(idp);
  if (!token) {
    /* Not logged in */
    dispatch({ type: actionTypes.ACCOUNT_LOGIN, user: null });
    return;
  }

  const user = await ws.sendAckedMessage(actionTypes.ACCOUNT_LOGIN, {
    token,
    idp,
  });
  player.login(idp, user.idpId, token);
  dispatch({ type: actionTypes.ACCOUNT_LOGIN, user });
}

export {
  accountSetFetchingUser,
  accountSetSettings,
  renderSignInButton,
  retryLoginOnConnect,
  signIn,
  signOut,
  tryAutoLogin,
};
