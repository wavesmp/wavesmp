const { assert } = require("chai");

const types = require("waves-action-types");

const actions = require("../src/layout");

describe("#layout()", () => {
  it("#layout()", () => {
    assert.isDefined(types.LAYOUT_SET);
    const layout = 2;
    const expectedAction = { type: types.LAYOUT_SET, layout };
    assert.deepEqual(actions.layoutSet(layout), expectedAction);
  });
});
