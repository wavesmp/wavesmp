const StorageSetup = require('./storageSetup')
const testUsers = require('./users')
const testLibrary = require('./library')
const testPlaylists = require('./playlists')

describe('Storage', () => {
  const storageSetup = new StorageSetup()
  const { getStorage } = storageSetup

  before(async function () {
    this.timeout(10000)
    await storageSetup.before()
  })

  testUsers(getStorage)

  testLibrary(getStorage)

  testPlaylists(getStorage)

  after(async () => {
    await storageSetup.after()
  })

})
