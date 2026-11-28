import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import { menuTypes } from "src/constants";
import type { Menu } from "src/types/stateTypes";

import { assertNewState, UNKNOWN_ACTION } from "src/testUtil";

import { menu } from "./menu";

const menu1: Menu = { type: menuTypes.TRACK, transform: "transform1" };

describe("#menu()", () => {
  let state: Menu[];
  let action: unknown;

  it("initial state", () => {
    state = assertNewState(menu, undefined, UNKNOWN_ACTION);
    assert.isArray(state);
    assert.lengthOf(state, 0);
  });

  it("set", () => {
    action = {
      type: actionTypes.MENU_SET,
      menu: menu1,
    };
    state = assertNewState(menu, state, action);

    assert.isArray(state);
    assert.lengthOf(state, 1);
    assert.strictEqual(state[0], menu1);
  });

  it("next", () => {
    action = {
      type: actionTypes.MENU_NEXT,
      menu: { type: menuTypes.PLAYLIST_ADD },
    };
    state = assertNewState(menu, state, action);

    assert.isArray(state);
    assert.lengthOf(state, 2);
    assert.strictEqual(state[0], menu1);
    /* The next menu opens where the previous one was */
    assert.deepEqual(state[1], {
      type: menuTypes.PLAYLIST_ADD,
      transform: menu1.transform,
    });
  });

  it("back", () => {
    action = { type: actionTypes.MENU_BACK };
    state = assertNewState(menu, state, action);

    assert.isArray(state);
    assert.lengthOf(state, 1);
    assert.strictEqual(state[0], menu1);
  });

  it("reset", () => {
    action = { type: actionTypes.MENU_RESET };
    state = assertNewState(menu, state, action);
    assert.isArray(state);
    assert.lengthOf(state, 0);
  });
});
