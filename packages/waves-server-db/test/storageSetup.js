const Docker = require('dockerode')
const Promise = require('bluebird')
const waitPort = require('wait-port')

const Storage = require('../')

const DB_CONTAINER_IMAGE_NAME = 'mongo:4.0.10'
const DB_CONTAINER_NAME = 'waves-server-db-test-db'
const DB_CONTAINER_PORT = '27018'
const DB_CONTAINER_CMD = ['mongod', '--port', DB_CONTAINER_PORT]

class StorageSetup {
  constructor() {
    this.docker = new Docker({ Promise })
    this.storage = null

    this.getStorage = this.getStorage.bind(this)
  }

  async before() {
    await this.cleanTestDb()

    await this.docker.pull(DB_CONTAINER_IMAGE_NAME)

    const dbContainer = await this.docker.createContainer({
      name: DB_CONTAINER_NAME,
      Image: DB_CONTAINER_IMAGE_NAME,
      Cmd: DB_CONTAINER_CMD,
      ExposedPorts: {
        [DB_CONTAINER_PORT + '/tcp']: {}
      },
      HostConfig: {
        NetworkMode: 'host'
      },
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: false,
      StdinOnce: false
    })
    await dbContainer.start()

    /* Wait for the DB to start listening */
    await waitPort({
      port: parseInt(DB_CONTAINER_PORT, 10),
      output: 'silent'
    })

    const url = `mongodb://localhost:${DB_CONTAINER_PORT}/waves`
    const dbConf = { url }
    this.storage = new Storage(dbConf)
    await this.storage.connect()
  }

  async after() {
    /* Ensure that storage is closed before cleaning test db.
     * See https://github.com/Automattic/mongoose/issues/1807 */
    await this.storage.close()
    await this.cleanTestDb()
  }

  async cleanTestDb() {
    const containers = await this.docker.listContainers()
    const dbContainers = containers
      .filter(c => c.Names.indexOf('/' + DB_CONTAINER_NAME) > -1)
      .map(
        /* Create container entity. Does not query API */
        c => this.docker.getContainer(c.Id)
      )

    await Promise.all(dbContainers.map(stopAndRemove))
  }

  getStorage() {
    return this.storage
  }
}

function stopAndRemove(c) {
  return c.stop().then(c => c.remove())
}

module.exports = StorageSetup
