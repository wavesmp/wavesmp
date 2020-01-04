#!/usr/bin/env node
const args = require('commander')

const Auth = require('waves-server-auth')
const log = require('waves-server-logger')
const Storage = require('waves-server-db')

const baseConfig = require('./baseConfig')
const WavesServer = require('./wavesServer')

function parseConfig() {
  args
    .version('1.0.0')
    .option(
      '-c, --config-file [FILE]',
      'path to the JSON config file [config.js]',
      '../config.js'
    )
    .parse(process.argv)

  const { configFile } = args

  try {
    const overrideConfig = require(configFile)
    log.debug(`Using config file: ${configFile}`)
    return { ...baseConfig, ...overrideConfig }
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e
    }
  }

  log.debug(`Did not find config file: ${configFile}. Skipping...`)
  return baseConfig
}

async function main() {
  try {
    const config = parseConfig()

    log.debug('Loaded config:', config)

    const storage = new Storage(config.db)
    const auth = new Auth(config.auth)
    const wavesServer = new WavesServer(config.port, storage, auth)
    log.debug('Created wavesServer')

    await wavesServer.start()
    log.info('Launched Waves server successfully')
  } catch (e) {
    log.error('Error starting server')
    log.error(e)
    log.error(e.stack)
    throw e
  }
}

main()
