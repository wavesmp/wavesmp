import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import * as actions from "./sidebar";

describe("#sidebar()", () => {
  it("#sidebarSet()", () => {
    const sidebar = true;
    assert.isDefined(actionTypes.SIDEBAR_SET);
    const expectedAction = { type: actionTypes.SIDEBAR_SET, sidebar };
    assert.deepEqual(actions.sidebarSet(sidebar), expectedAction);
  });
});
