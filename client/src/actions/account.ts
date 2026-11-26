import { actionTypes } from "src/actionTypes";
import type { Auth } from "src/auth";
import type { Player } from "src/player";
import type { WavesSocket } from "src/socket";
import type { Dispatch, Thunk, WavesAction } from "src/types/actionTypes";
import type { AccountSettings } from "src/types/stateTypes";

function accountSetFetchingUser(
  fetchingUser: boolean,
): Extract<
  WavesAction,
  { type: typeof actionTypes.ACCOUNT_SET_FETCHING_USER }
> {
  return { type: actionTypes.ACCOUNT_SET_FETCHING_USER, fetchingUser };
}

function accountSetSettings(settings: AccountSettings): Thunk<void> {
  const { theme } = settings;
  if (theme) {
    document.documentElement.className = `theme-${theme}`;
  }
  return (dispatch, _getState, { localState }) => {
    dispatch({ type: actionTypes.ACCOUNT_SET_SETTINGS, settings });
    const { columns, rowsPerPage } = settings;
    /* Settings must be JSON serializable */
    if (columns !== undefined) {
      void localState.setItem("columns", [...columns]);
    }
    if (rowsPerPage !== undefined) {
      void localState.setItem("rowsPerPage", rowsPerPage);
    }
    if (theme !== undefined) {
      void localState.setItem("theme", theme);
    }
  };
}

function signOut(): Thunk<Promise<void>> {
  return async (dispatch, _getState, { auth, localState, ws }) => {
    const lastIdp = await localState.getItem("lastIdp");
    await auth.signOut(lastIdp);
    await localState.setItem("lastIdp", "");
    dispatch({ type: actionTypes.ACCOUNT_LOGIN, user: null });
    ws.setOnConnect(null);
  };
}

function signIn(idp: string): Thunk<Promise<void>> {
  return async (dispatch, _getState, { auth, player, ws, localState }) => {
    await auth.signIn(idp);
    await _tryAutoLogin(dispatch, idp, auth, player, ws);
    void localState.setItem("lastIdp", idp);
  };
}

function renderSignInButton(
  idp: string,
  element: HTMLElement,
  onSignIn: (token: string) => void,
): Thunk<void> {
  return (_dispatch, _getState, { auth }) => {
    auth.renderButton(idp, element, onSignIn);
  };
}

function retryLoginOnConnect(idp: string): Thunk<Promise<void>> {
  return async (dispatch, _getState, { ws }) => {
    ws.setOnConnect(() => {
      dispatch(tryAutoLogin(idp)).then(
        () => {
          console.log("Authenticated after reconnect");
        },
        (err: unknown) => {
          console.log("Failed to authenticate after reconnect");
          console.log(err);
        },
      );
    });
    return Promise.resolve();
  };
}

function tryAutoLogin(idp: string): Thunk<Promise<void>> {
  return async (dispatch, _getState, { auth, player, ws }) => {
    await _tryAutoLogin(dispatch, idp, auth, player, ws);
  };
}

async function _tryAutoLogin(
  dispatch: Dispatch,
  idp: string,
  auth: Auth,
  player: Player,
  ws: WavesSocket,
): Promise<void> {
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
