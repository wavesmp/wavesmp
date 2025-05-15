const { assert } = require("chai");

const types = require("waves-action-types");

const actions = require("../src/menu");

describe("#menu()", () => {
  it("#menuReset()", () => {
    assert.isDefined(types.MENU_RESET);
    const expectedAction = { type: types.MENU_RESET };
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

    assert.isDefined(types.MENU_SET);
    const expectedMenu = {
      ...menu,
      transform: "translate(0px, 0px)",
    };

    const expectedAction = { type: types.MENU_SET, menu: expectedMenu };
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

    assert.isDefined(types.MENU_SET);
    const expectedMenu = {
      ...menu,
      transform: "translate(calc(200px - 100%), 0px)",
    };

    const expectedAction = { type: types.MENU_SET, menu: expectedMenu };
    assert.deepEqual(actions.menuSet(menu), expectedAction);
  });

  it("#menuNext()", () => {
    assert.isDefined(types.MENU_NEXT);
    const menu = "testMenu";
    const expectedAction = { type: types.MENU_NEXT, menu };
    assert.deepEqual(actions.menuNext(menu), expectedAction);
  });

  it("#menuBack()", () => {
    assert.isDefined(types.MENU_BACK);
    const expectedAction = { type: types.MENU_BACK };
    assert.deepEqual(actions.menuBack(), expectedAction);
  });
});
