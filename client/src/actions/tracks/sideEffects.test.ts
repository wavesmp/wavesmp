import * as sinon from "sinon";
import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import { LIBRARY_NAME, toastTypes } from "src/constants";
import { Player } from "src/player";
import { callThunk, newTrackId } from "src/testUtil";
import {
  TEST_TRACK1 as baseTrack1,
  TEST_TRACK2 as baseTrack2,
} from "src/testUtil/testData";
import type { Thunk } from "src/types/actionTypes";
import type { Toast } from "src/types/stateTypes";

import * as actions from "./sideEffects";

const track1 = { ...baseTrack1, id: newTrackId() };
const track2 = { ...baseTrack2, id: newTrackId() };
const library = {
  [track1.id]: track1,
  [track2.id]: track2,
};
const libraries = {
  [LIBRARY_NAME]: library,
};

describe("#sideEffects()", () => {
  it("#download()", async () => {
    const player = new Player({});

    const dispatchMock = sinon.mock();
    const dispatchExpect = dispatchMock.twice();

    const thunk = actions.download(track1.id);

    const playerMock = sinon.mock(player);
    playerMock.expects("download").once().withExactArgs(track1);

    const tracks = { libraries };
    await callThunk(thunk, dispatchMock, () => ({ tracks }), { player });

    const firstDisptachCall = dispatchExpect.firstCall;
    const firstCallArgs = firstDisptachCall.args;
    assert.lengthOf(firstCallArgs, 1);
    const firstCallArg = firstCallArgs[0] as Thunk<void>;
    callThunk(firstCallArg, dispatchMock);

    const secondDispatchCall = dispatchExpect.secondCall;
    const secondCallArgs = secondDispatchCall.args;
    assert.lengthOf(secondCallArgs, 1);
    const secondCallArg = secondCallArgs[0] as { type: string; toast: Toast };
    assert.lengthOf(Object.keys(secondCallArg), 2);
    assert.strictEqual(secondCallArg.type, actionTypes.TOAST_ADD);
    const secondCallToast = secondCallArg.toast;
    assert.lengthOf(Object.keys(secondCallToast), 3);
    assert.strictEqual(secondCallToast.type, toastTypes.Success);
    assert.strictEqual(secondCallToast.msg, "Download started");
    assert.isNumber(secondCallToast.id);

    playerMock.verify();
    dispatchMock.verify();
  });
});
