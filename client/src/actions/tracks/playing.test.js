import * as sinon from "sinon";
import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import { Player } from "src/player";

import * as actions from "./playing";

describe("#playing()", () => {
  it("#pause()", () => {
    const player = new Player({});
    const playerMock = sinon.mock(player);
    playerMock.expects("pause").once().withExactArgs();

    const dispatchMock = sinon.mock();
    assert.isDefined(actionTypes.PLAYING_PAUSE);
    dispatchMock.once().withExactArgs({
      type: actionTypes.PLAYING_PAUSE,
    });

    const thunk = actions.pause();
    thunk(dispatchMock, undefined, { player });

    dispatchMock.verify();
    playerMock.verify();
  });

  it("#play()", () => {
    const player = new Player({});
    const playerMock = sinon.mock(player);
    playerMock.expects("play").once().withExactArgs();

    const dispatchMock = sinon.mock();
    assert.isDefined(actionTypes.PLAYING_PLAY);
    dispatchMock.once().withExactArgs({
      type: actionTypes.PLAYING_PLAY,
    });

    const thunk = actions.play();
    thunk(dispatchMock, null, { player });

    dispatchMock.verify();
    playerMock.verify();
  });

  it("#seek()", () => {
    const newTime = 3;
    const player = new Player({});
    const playerMock = sinon.mock(player);
    playerMock.expects("seek").once().withExactArgs(newTime);

    const thunk = actions.seek(newTime);
    thunk(undefined, undefined, { player });

    playerMock.verify();
  });

  it("#repeatToggle()", () => {
    assert.isDefined(actionTypes.PLAYING_REPEAT_TOGGLE);
    const action = { type: actionTypes.PLAYING_REPEAT_TOGGLE };
    assert.deepEqual(actions.repeatToggle(), action);
  });

  it("#shuffleToggle()", () => {
    assert.isDefined(actionTypes.PLAYING_SHUFFLE_TOGGLE);
    const action = { type: actionTypes.PLAYING_SHUFFLE_TOGGLE };
    assert.deepEqual(actions.shuffleToggle(), action);
  });
});
