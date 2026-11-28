import { LocalStorage } from "node-localstorage";
import * as sinon from "sinon";
import { assert, describe, it, vi } from "vitest";

import { actionTypes } from "src/actionTypes";
import { Auth } from "src/auth";
import { LocalState } from "src/localState";
import { Player } from "src/player";
import { WavesSocket } from "src/socket";
import { callThunk, deleteLocation } from "src/testUtil";
import {
  TEST_IDP as testIdp,
  TEST_TOKEN as testToken,
  TEST_USER1 as testUser,
} from "src/testUtil/testData";

import * as actions from "./account";

const LOCAL_STORAGE_PATH = "./wavesmp-account-localstorage-cache";

describe("#account()", () => {
  it("#accountSetFetchingUser()", () => {
    const fetchingUser = false;
    assert.isDefined(actionTypes.ACCOUNT_SET_FETCHING_USER);
    const expectedAction = {
      type: actionTypes.ACCOUNT_SET_FETCHING_USER,
      fetchingUser,
    };
    assert.deepEqual(
      actions.accountSetFetchingUser(fetchingUser),
      expectedAction,
    );
  });

  it("#accountSetSettings()", () => {
    const mockDoc = { documentElement: {} as { className?: string } };
    vi.stubGlobal("document", mockDoc);

    const localStorage = new LocalStorage(LOCAL_STORAGE_PATH);
    const localState = new LocalState(localStorage);

    const columns = new Set(["title", "artist", "genre"]);
    const rowsPerPage = 25;
    const theme = "testTheme";
    const thunk = actions.accountSetSettings({ columns, rowsPerPage, theme });

    const action = {
      type: actionTypes.ACCOUNT_SET_SETTINGS,
      settings: { columns, rowsPerPage, theme },
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const localStateMock = sinon.mock(localState);
    const localStateExpect = localStateMock.expects("setItem").thrice();

    callThunk(thunk, dispatchMock, undefined, { localState });

    const firstLocalStateCall = localStateExpect.firstCall;
    assert.isTrue(
      firstLocalStateCall.calledWithExactly("columns", [...columns]),
    );

    const secondLocalStateCall = localStateExpect.secondCall;
    assert.isTrue(
      secondLocalStateCall.calledWithExactly("rowsPerPage", rowsPerPage),
    );

    const thirdLocalStateCall = localStateExpect.thirdCall;
    assert.isTrue(thirdLocalStateCall.calledWithExactly("theme", theme));

    assert.strictEqual(mockDoc.documentElement.className, "theme-testTheme");

    dispatchMock.verify();
    localStateMock.verify();
    deleteLocation(localStorage);
  });

  it("#signOut()", async () => {
    const ws = new WavesSocket(() => ({}) as WebSocket);
    const auth = new Auth({});
    const localStorage = new LocalStorage(LOCAL_STORAGE_PATH);
    const localState = new LocalState(localStorage);

    const thunk = actions.signOut();

    const action = { type: actionTypes.ACCOUNT_LOGIN, user: null };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const authMock = sinon.mock(auth);
    authMock.expects("signOut").once().withExactArgs(testIdp);

    const localStateMock = sinon.mock(localState);
    localStateMock
      .expects("getItem")
      .once()
      .withExactArgs("lastIdp")
      .returns(testIdp);
    localStateMock.expects("setItem").once().withExactArgs("lastIdp", "");

    const wsMock = sinon.mock(ws);
    wsMock.expects("setOnConnect").once().withExactArgs(null);

    await callThunk(thunk, dispatchMock, undefined, { auth, ws, localState });

    dispatchMock.verify();
    authMock.verify();
    localStateMock.verify();
    deleteLocation(localStorage);
    wsMock.verify();
  });

  it("sign in auth not verified", async () => {
    const ws = new WavesSocket(() => ({}) as WebSocket);
    const auth = new Auth({});

    const thunk = actions.signIn(testIdp);

    const authMock = sinon.mock(auth);
    authMock.expects("signIn").once().withExactArgs(testIdp);
    authMock
      .expects("tryAutoLogin")
      .once()
      .withExactArgs(testIdp)
      .returns(testToken);

    const wsMock = sinon.mock(ws);
    const loginErr = new Error("Waves internal server error");
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(actionTypes.ACCOUNT_LOGIN, {
        token: testToken,
        idp: testIdp,
      })
      .rejects(loginErr);

    try {
      await callThunk(thunk, undefined, undefined, { auth, ws });
      assert.fail("Expected sign in to throw");
    } catch (err) {
      assert.strictEqual(err, loginErr);
    }

    authMock.verify();
    wsMock.verify();
  });

  it("sign in successful", async () => {
    const ws = new WavesSocket(() => ({}) as WebSocket);
    const auth = new Auth({});
    const localStorage = new LocalStorage(LOCAL_STORAGE_PATH);
    const localState = new LocalState(localStorage);
    const player = new Player({});

    const thunk = actions.signIn(testIdp);

    const action = { type: actionTypes.ACCOUNT_LOGIN, user: testUser };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    const authMock = sinon.mock(auth);
    authMock.expects("signIn").once().withExactArgs(testIdp);
    authMock
      .expects("tryAutoLogin")
      .once()
      .withExactArgs(testIdp)
      .returns(testToken);

    const localStateMock = sinon.mock(localState);
    localStateMock.expects("setItem").once().withExactArgs("lastIdp", testIdp);

    const wsMock = sinon.mock(ws);
    wsMock
      .expects("sendAckedMessage")
      .once()
      .withExactArgs(actionTypes.ACCOUNT_LOGIN, {
        token: testToken,
        idp: testIdp,
      })
      .resolves(testUser);

    const playerMock = sinon.mock(player);
    playerMock
      .expects("login")
      .once()
      .withExactArgs(testIdp, testUser.idpId, testToken);

    await callThunk(thunk, dispatchMock, undefined, {
      auth,
      player,
      localState,
      ws,
    });

    dispatchMock.verify();
    authMock.verify();
    wsMock.verify();
    playerMock.verify();
    localStateMock.verify();

    deleteLocation(localStorage);
  });

  it("#renderSignInButton()", () => {
    const auth = new Auth({});
    const element = {} as HTMLElement;
    const onSignIn = (): void => undefined;

    const authMock = sinon.mock(auth);
    authMock
      .expects("renderButton")
      .once()
      .withExactArgs(testIdp, element, onSignIn);

    callThunk(
      actions.renderSignInButton(testIdp, element, onSignIn),
      undefined,
      undefined,
      { auth },
    );

    authMock.verify();
  });
});
