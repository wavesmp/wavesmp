const { assert } = require("chai");

const types = require("waves-action-types");

const actions = require("../src/sidebar");

describe("#sidebar()", () => {
  it("#sidebarSet()", () => {
    const sidebar = true;
    assert.isDefined(types.SIDEBAR_SET);
    const expectedAction = { type: types.SIDEBAR_SET, sidebar };
    assert.deepEqual(actions.sidebarSet(sidebar), expectedAction);
  });
});
