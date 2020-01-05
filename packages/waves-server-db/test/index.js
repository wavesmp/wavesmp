const StorageSetup = require('./storageSetup')
const testUsers = require('./users')
const testLibrary = require('./library')
const testPlaylists = require('./playlists')
const testReorder = require('./reorder')
const testValidators = require('./validators')

describe('Storage', () => {
  const storageSetup = new StorageSetup()
  const { getStorage } = storageSetup

  before(async function beforeFunc() {
    this.timeout(10000)
    await storageSetup.before()
  })

  testValidators()

  testReorder()

  testUsers(getStorage)

  testLibrary(getStorage)

  testPlaylists(getStorage)

  after(async () => {
    await storageSetup.after()
  })
})
