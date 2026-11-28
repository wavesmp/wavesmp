import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import type { Account } from "src/types/stateTypes";

import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";
import { TEST_USER1 as user } from "src/testUtil/testData";

import { account } from "./account";

describe("#account()", () => {
  let state: Account;
  let action: unknown;

  it("initial state", () => {
    state = assertNewState(account, undefined, UNKNOWN_ACTION);
    assert.isObject(state);
    assert.lengthOf(Object.keys(state), 5);
    const { columns, rowsPerPage, user, fetchingUser } = state;
    assert.strictEqual(columns, null);
    assert.strictEqual(rowsPerPage, null);
    assert.strictEqual(user, null);
    assert.strictEqual(fetchingUser, true);
  });

  it("account login", () => {
    action = { type: actionTypes.ACCOUNT_LOGIN, user };
    state = assertNewState(account, state, action);

    assert.isObject(state);
    assert.lengthOf(Object.keys(state), 5);
    assert.strictEqual(state.user, user);
    assert.strictEqual(state.fetchingUser, false);
  });

  it("set account settings", () => {
    const columns = new Set(["Name", "Title"]);
    const rowsPerPage = 50;
    const theme = "testTheme";
    action = {
      type: actionTypes.ACCOUNT_SET_SETTINGS,
      settings: { columns, rowsPerPage, theme },
    };
    state = assertNewState(account, state, action);

    assert.isObject(state);
    assert.lengthOf(Object.keys(state), 5);
    assert.strictEqual(state.columns, columns);
    assert.strictEqual(state.rowsPerPage, rowsPerPage);
    assert.strictEqual(state.theme, theme);
  });

  it("set account fetchingUser", () => {
    const fetchingUser = true;
    action = { type: actionTypes.ACCOUNT_SET_FETCHING_USER, fetchingUser };
    state = assertNewState(account, state, action);

    assert.isObject(state);
    assert.strictEqual(state.fetchingUser, fetchingUser);
  });
});
