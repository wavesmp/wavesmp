import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import { TEST_MODAL1 as testModal } from "src/testUtil/testData.json";

import * as actions from "./modal";

describe("#modal()", () => {
  it("#modalSet()", () => {
    assert.isDefined(actionTypes.MODAL_SET);
    const expectedAction = { type: actionTypes.MODAL_SET, modal: testModal };
    assert.deepEqual(actions.modalSet(testModal), expectedAction);
  });
});
