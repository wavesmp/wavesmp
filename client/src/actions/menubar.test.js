import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import * as actions from "./menubar";

describe("#menubar()", () => {
  it("#menubarSet()", () => {
    const menubar = true;
    assert.isDefined(actionTypes.MENUBAR_SET);
    const expectedAction = { type: actionTypes.MENUBAR_SET, menubar };
    assert.deepEqual(actions.menubarSet(menubar), expectedAction);
  });
});
