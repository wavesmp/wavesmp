const { assert } = require('chai')

const types = require('waves-action-types')

const actions = require('../src/contextmenu')

describe('#contextmenu()', () => {
  it('#contextmenuReset()', () => {
    assert.isDefined(types.CONTEXTMENU_RESET)
    const expectedAction = { type: types.CONTEXTMENU_RESET }
    assert.deepEqual(actions.contextmenuReset(), expectedAction)
  })

  it('#contextmenuSet() to the right', () => {
    global.window = {
      pageXOffset: 0,
      innerWidth: 300
    }
    global.CONTEXTMENU_WIDTH = 200

    const menu = {
      type: 'type1',
      ev: {
        pageX: 0,
        pageY: 0
      },
      props: {
        prop: 'prop1'
      }
    }

    assert.isDefined(types.CONTEXTMENU_SET)
    const expectedMenu = {
      ...menu,
      transform: 'translate(0px, 0px)'
    }

    const expectedAction = { type: types.CONTEXTMENU_SET, menu: expectedMenu }
    assert.deepEqual(actions.contextmenuSet(menu), expectedAction)
  })

  it('#contextmenuSet() to the left', () => {
    global.window = {
      pageXOffset: 0,
      innerWidth: 300
    }
    global.CONTEXTMENU_WIDTH = 200

    const menu = {
      type: 'type1',
      ev: {
        pageX: 200,
        pageY: 0
      },
      props: {
        prop: 'prop1'
      }
    }

    assert.isDefined(types.CONTEXTMENU_SET)
    const expectedMenu = {
      ...menu,
      transform: 'translate(calc(200px - 100%), 0px)'
    }

    const expectedAction = { type: types.CONTEXTMENU_SET, menu: expectedMenu }
    assert.deepEqual(actions.contextmenuSet(menu), expectedAction)
  })

  it('#contextmenuNext()', () => {
    assert.isDefined(types.CONTEXTMENU_NEXT)
    const menu = 'testMenu'
    const expectedAction = { type: types.CONTEXTMENU_NEXT, menu }
    assert.deepEqual(actions.contextmenuNext(menu), expectedAction)
  })

  it('#contextmenuBack()', () => {
    assert.isDefined(types.CONTEXTMENU_BACK)
    const expectedAction = { type: types.CONTEXTMENU_BACK }
    assert.deepEqual(actions.contextmenuBack(), expectedAction)
  })
})
