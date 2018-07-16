const { assert } = require('chai')
const { LocalStorage } = require('node-localstorage')
const ObjectID = require("bson-objectid")

const LocalState = require('../src')
const { CONFIG_KEY } = require('../src/storageInit')

const LOCAL_STORAGE_PATH = './node-localstorage-cache'

describe('waves-client-local-state', async () => {
  let localStorage
  let localState

  it('Check unknown keys are cleaned up. Override defaults', async () => {
    localStorage = new LocalStorage(LOCAL_STORAGE_PATH)
    localStorage.setItem('unknownKey', 'cleanme')
    const config = {
      unknownStateKey: 'cleanmetoo',
      columns: ['Name', 'State', 'Time'],
      rowsPerPage: 5,
      lastIdp: '',
      machineId: 1010
    }
    const expectedConfig = {
      columns: ['Name', 'State', 'Time'],
      rowsPerPage: 5,
      lastIdp: '',
      machineId: 1010
    }
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))

    localState = new LocalState(localStorage)

    assert.lengthOf(localStorage, 1)
    assert.strictEqual(localStorage.key(0), CONFIG_KEY)
    assert.deepEqual(JSON.parse(localStorage.getItem(CONFIG_KEY)), expectedConfig)

    const localStateKeys = await localState.keys()
    assert.lengthOf(localStateKeys, 4)
    const actualColumns = await localState.getItem('columns')
    assert.deepEqual(actualColumns, expectedConfig.columns)
    const actualRowsPerPage = await localState.getItem('rowsPerPage')
    assert.strictEqual(actualRowsPerPage, expectedConfig.rowsPerPage)
    const actualLastIdp = await localState.getItem('lastIdp')
    assert.strictEqual(actualLastIdp, expectedConfig.lastIdp)
    const actualMachineId = await localState.getItem('machineId')
    assert.strictEqual(actualMachineId, expectedConfig.machineId)

    localStorage._deleteLocation()
  })

  it('Check defaults, then update', async () => {
    localStorage = new LocalStorage(LOCAL_STORAGE_PATH)
    localState = new LocalState(localStorage)

    const defaultConfig = {
      columns: ['Name', 'State', 'Time', 'Artist', 'Genre'],
      rowsPerPage: 25,
      lastIdp: '',
      machineId: ObjectID.getMachineID()
    }

    assert.lengthOf(localStorage, 1)
    assert.strictEqual(localStorage.key(0), CONFIG_KEY)
    assert.deepEqual(JSON.parse(localStorage.getItem(CONFIG_KEY)), defaultConfig)

    const localStateKeys = await localState.keys()
    assert.lengthOf(localStateKeys, 4)
    let actualColumns = await localState.getItem('columns')
    assert.deepEqual(actualColumns, defaultConfig.columns)
    let actualRowsPerPage = await localState.getItem('rowsPerPage')
    assert.strictEqual(actualRowsPerPage, defaultConfig.rowsPerPage)
    let actualLastIdp = await localState.getItem('lastIdp')
    assert.strictEqual(actualLastIdp, defaultConfig.lastIdp)
    let actualMachineId = await localState.getItem('machineId')
    assert.strictEqual(actualMachineId, defaultConfig.machineId)

    const newColumns = ['Name', 'State', 'Time']
    localState.setItem('columns', newColumns)

    const newRowsPerPage = 5
    localState.setItem('rowsPerPage', newRowsPerPage)

    const newLastIdp = 'updatedIdp'
    localState.setItem('lastIdp', newLastIdp)

    const newMachineId = 2020
    localState.setItem('machineId', newMachineId)

    actualColumns = await localState.getItem('columns')
    assert.deepEqual(actualColumns, newColumns)
    actualRowsPerPage = await localState.getItem('rowsPerPage')
    assert.strictEqual(actualRowsPerPage, newRowsPerPage)
    actualLastIdp = await localState.getItem('lastIdp')
    assert.strictEqual(actualLastIdp, newLastIdp)
    actualMachineId = await localState.getItem('machineId')
    assert.strictEqual(actualMachineId, newMachineId)
    localStorage._deleteLocation()
  })

})
