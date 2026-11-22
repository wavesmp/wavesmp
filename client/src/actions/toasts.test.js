import * as sinon from "sinon";
import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import { TEST_TOAST1 as toast1 } from "src/testUtil/testData.json";

import * as actions from "./toasts";

describe("#toasts()", () => {
  it("toastAdd", async () => {
    const timeout = 10;
    const toast = { ...toast1, timeout };
    const thunk = actions.toastAdd(toast);

    const firstAction = { type: actionTypes.TOAST_ADD, toast };
    const secondAction = { type: actionTypes.TOAST_REMOVE, id: toast.id };

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
    assert.isDefined(actionTypes.TOAST_REMOVE);
    const expectedAction = { type: actionTypes.TOAST_REMOVE, id: testId };
    assert.deepEqual(actions.toastRemove(testId), expectedAction);
  });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
