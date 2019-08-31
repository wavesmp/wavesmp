const Promise = require('bluebird')
const WebSocket = require('ws')

const types = require('waves-action-types')
const Encoder = require('waves-encoder')
const log = require('waves-server-logger')

const HEARTBEAT_INTERVAL = 25000

class Server {
  constructor(port, storage, auth) {
    this.storage = storage
    this.auth = auth
    this.encoder = new Encoder()
    this.clients = {}

    this.listenPromise = new Promise((resolve, reject) => {
      this.wss = new WebSocket.Server({ port, perMessageDeflate: true }, err =>
        err ? reject(err) : resolve()
      )
    })

    this.onConnection = this.onConnection.bind(this)
    this.onServerError = this.onServerError.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onError = this.onError.bind(this)
    this.onPing = this.onPing.bind(this)
    this.onPong = this.onPong.bind(this)
    this.heartbeat = this.heartbeat.bind(this)

    this.messageMap = {
      [types.PLAYLIST_ADD]: async (ws, user, data) => {
        log.info('Track added to playlist')
        const { playlistName, trackIds } = data
        return await this.storage.playlistAdd(user, playlistName, trackIds)
      },

      [types.TRACKS_REMOVE]: async (ws, user, data) => {
        log.info('Track removed from playlist')
        const { playlistName, selection } = data
        return await this.storage.tracksRemove(user, playlistName, selection)
      },

      [types.PLAYLIST_REORDER]: async (ws, user, data) => {
        const { playlistName, selection, insertAt } = data
        log.info(`Reordering playlist ${playlistName}`)
        return await this.storage.playlistReorder(
          user,
          playlistName,
          selection,
          insertAt
        )
      },

      [types.PLAYLIST_COPY]: async (ws, user, data) => {
        const { src, dest } = data
        log.info('Copying playlist')
        await this.storage.playlistCopy(user, src, dest)
      },

      [types.PLAYLIST_MOVE]: async (ws, user, data) => {
        log.info('Renaming playlist')
        const { src, dest } = data
        await this.storage.playlistMove(user, src, dest)
      },

      [types.PLAYLIST_DELETE]: async (ws, user, data) => {
        const { playlistName } = data
        log.info(`Deleting playlist: ${playlistName}`)
        await this.storage.deletePlaylist(user, playlistName)
      },

      [types.TRACKS_INFO_UPDATE]: async (ws, user, data) => {
        log.info('Updating track info')
        const { id, key, value } = data
        const updateObj = { [key]: value }
        await this.storage.updateTrack(user, id, updateObj)
      },
      [types.TRACKS_ADD]: async (ws, user, data) => {
        const { tracks } = data
        log.info('Importing tracks to library', tracks)
        await this.storage.addTracks(user, tracks)
      },
      [types.TRACKS_DELETE]: async (ws, user, data) => {
        const { deleteIds } = data
        log.info(`Deleting from library: ${deleteIds}`)
        await this.storage.deleteTracks(user, deleteIds)
      }
    }
  }

  async start() {
    await Promise.all([this.listenPromise, this.storage.connect()])
    this.wss.on('connection', this.onConnection)
    this.wss.on('error', this.onServerError)
  }

  onServerError(err) {
    log.error(`Server encountered error: ${err}`)
  }

  onConnection(ws) {
    try {
      let user = null
      log.info('Client connected')

      ws.on('message', async msg => {
        try {
          msg = this.encoder.decode(msg)
        } catch (err) {
          log.error(`Error decoding message: ${err}`)
          return
        }

        const { type, data, reqId } = msg

        try {
          // Verify auth before processing message
          if (!user) {
            if (type !== types.ACCOUNT_LOGIN) {
              const errMsg = `User is not logged in. Invalid message type: ${type}`
              log.error(errMsg)

              if (reqId) {
                const resp = { err: errMsg }
                this.sendMessage(ws, type, resp, reqId)
              }

              return
            }

            const { idp, token } = data
            try {
              user = await this.auth.login(idp, token)
            } catch (err) {
              log.error(`Failed to authenticate user: ${err}`)
              const resp = { err: `${err}` }
              if (reqId) {
                this.sendMessage(ws, type, resp, reqId)
              }
              return
            }

            const { idpId, email, name } = user
            log.info('Client logged in:', name)
            await this.storage.createOrUpdateUser(idp, idpId, email, name)
            this.sendMessage(ws, type, { ...user }, reqId)

            const library = await this.storage.getLibrary(user)
            this.sendMessage(ws, types.TRACKS_ADD, library)

            const playlists = await this.storage.getPlaylists(user)
            this.sendMessage(ws, types.PLAYLISTS_UPDATE, playlists)
            return
          }

          const resp = await this.messageMap[type](ws, user, data, reqId)
          if (reqId) {
            this.sendMessage(ws, type, resp || {}, reqId)
          }
        } catch (err) {
          const errString = err.message || `${err}`
          const name = user ? user.name : ''
          log.error(
            `Error processing message ${type} for ${name}: ${errString}`
          )
          log.error(err)
          log.error(err.stack)
          if (reqId) {
            this.sendMessage(ws, type, { err: errString }, reqId)
          }
        }
      })
      this.clients[ws] = setTimeout(
        () => this.heartbeat(ws),
        HEARTBEAT_INTERVAL
      )
      ws.on('close', (code, reason) => this.onClose(ws, code, reason))
      ws.on('error', this.onError)
      ws.on('ping', this.onPing)
      ws.on('pong', this.onPong)
    } catch (err) {
      const errMsg = `Error handling "connection" event: ${err}`
      log.error(errMsg)
    }
  }

  onError(err) {
    log.error(`Client encountered error: ${err}`)
  }

  onClose(ws, code, reason) {
    clearTimeout(this.clients[ws])
    delete this.clients[ws]
    log.info('Client closed connection')
    log.info(`Code: ${code}`)
    log.info(`Reason: ${reason}`)
  }

  onPong() {
    log.info('Client pong')
  }

  onPing() {
    log.info('Client ping')
  }

  sendMessage(ws, type, data, reqId) {
    if (data == null) {
      /* In order to facilitate error handling, data should be an object,
       * with an optional err attribute if there was an error */
      throw new Error('Cannot send empty data')
    }
    const raw = { type, data }
    if (reqId) {
      raw.reqId = reqId
    }

    const cooked = this.encoder.encode(raw)
    ws.send(cooked)
  }

  heartbeat(ws) {
    if (ws.readyState !== ws.OPEN) {
      return
    }
    log.info('Heartbeating to client')
    ws.ping()
    this.clients[ws] = setTimeout(() => this.heartbeat(ws), HEARTBEAT_INTERVAL)
  }

  close() {
    return new Promise((resolve, reject) => {
      this.wss.close(err => (err ? reject(err) : resolve()))
    })
  }
}

module.exports = Server
