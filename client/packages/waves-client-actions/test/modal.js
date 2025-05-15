const { assert } = require("chai");

const types = require("waves-action-types");
const { TEST_MODAL1: testModal } = require("waves-test-data");

const actions = require("../src/modal");

describe("#modal()", () => {
  it("#modalSet()", () => {
    assert.isDefined(types.MODAL_SET);
    const expectedAction = { type: types.MODAL_SET, modal: testModal };
    assert.deepEqual(actions.modalSet(testModal), expectedAction);
  });
});
