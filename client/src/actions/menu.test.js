import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";

import * as actions from "./menu";

describe("#menu()", () => {
  it("#menuReset()", () => {
    assert.isDefined(actionTypes.MENU_RESET);
    const expectedAction = { type: actionTypes.MENU_RESET };
    assert.deepEqual(actions.menuReset(), expectedAction);
  });

  it("#menuSet() to the right", () => {
    global.window = {
      pageXOffset: 0,
      innerWidth: 300,
    };
    global.MENU_WIDTH = 200;

    const menu = {
      type: "type1",
      ev: {
        pageX: 0,
        pageY: 0,
      },
      props: {
        prop: "prop1",
      },
    };

    assert.isDefined(actionTypes.MENU_SET);
    const expectedMenu = {
      ...menu,
      transform: "translate(0px, 0px)",
    };

    const expectedAction = { type: actionTypes.MENU_SET, menu: expectedMenu };
    assert.deepEqual(actions.menuSet(menu), expectedAction);
  });

  it("#menuSet() to the left", () => {
    global.window = {
      pageXOffset: 0,
      innerWidth: 300,
    };
    global.MENU_WIDTH = 200;

    const menu = {
      type: "type1",
      ev: {
        pageX: 200,
        pageY: 0,
      },
      props: {
        prop: "prop1",
      },
    };

    assert.isDefined(actionTypes.MENU_SET);
    const expectedMenu = {
      ...menu,
      transform: "translate(calc(200px - 100%), 0px)",
    };

    const expectedAction = { type: actionTypes.MENU_SET, menu: expectedMenu };
    assert.deepEqual(actions.menuSet(menu), expectedAction);
  });

  it("#menuNext()", () => {
    assert.isDefined(actionTypes.MENU_NEXT);
    const menu = "testMenu";
    const expectedAction = { type: actionTypes.MENU_NEXT, menu };
    assert.deepEqual(actions.menuNext(menu), expectedAction);
  });

  it("#menuBack()", () => {
    assert.isDefined(actionTypes.MENU_BACK);
    const expectedAction = { type: actionTypes.MENU_BACK };
    assert.deepEqual(actions.menuBack(), expectedAction);
  });
});
