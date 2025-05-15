const { assert } = require("chai");
const sinon = require("sinon");

const types = require("waves-action-types");
const { TEST_TOAST1: toast1 } = require("waves-test-data");

const actions = require("../src/toasts");

describe("#toasts()", () => {
  it("toastAdd", async () => {
    const timeout = 10;
    const toast = { ...toast1, timeout };
    const thunk = actions.toastAdd(toast);

    const firstAction = { type: types.TOAST_ADD, toast };
    const secondAction = { type: types.TOAST_REMOVE, id: toast.id };

    const dispatchMock = sinon.mock();
    const dispatchExpect = dispatchMock.twice();

    thunk(dispatchMock);

    await sleep(timeout + 1);

    const firstDispatchCall = dispatchExpect.firstCall;
    assert.isTrue(firstDispatchCall.calledWithExactly(firstAction));

    const secondDispatchCall = dispatchExpect.secondCall;
    assert.isTrue(secondDispatchCall.calledWithExactly(secondAction));

    dispatchMock.verify();
  });

  it("#toastRemove()", () => {
    const testId = "testId";
    assert.isDefined(types.TOAST_REMOVE);
    const expectedAction = { type: types.TOAST_REMOVE, id: testId };
    assert.deepEqual(actions.toastRemove(testId), expectedAction);
  });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
