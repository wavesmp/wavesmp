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

    this.listenPromise = new Promise((resolve, reject) => {
      this.wss = new WebSocket.Server({ port }, err => err ? reject(err) : resolve())
    })

    this.onConnection = this.onConnection.bind(this)
    this.onServerError = this.onServerError.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onError = this.onError.bind(this)
    this.onPing = this.onPing.bind(this)
    this.onPong = this.onPong.bind(this)
    this.heartbeat = this.heartbeat.bind(this)

    this.messageMap = {
      [types.PLAYLIST_ADD]: async (ws, user, data, reqId) => {
        log.info('Track added to playlist')
        const { playlistName, trackIds } = data
        await this.storage.playlistAdd(user, playlistName, trackIds)
        if (reqId) {
          this.sendMessage(ws, types.PLAYLIST_ADD, {}, reqId)
        }
      },

      [types.PLAYLIST_REMOVE]: async (ws, user, data, reqId) => {
        log.info('Track removed from playlist')
        const { playlistName, deleteIndexes } = data
        await this.storage.playlistRemove(user, playlistName, deleteIndexes)
        if (reqId) {
          this.sendMessage(ws, types.PLAYLIST_REMOVE, {}, reqId)
        }
      },

      [types.PLAYLIST_COPY]: async (ws, user, data, reqId) => {
        const { src, dest } = data
        log.info('Copying playlist')
        await this.storage.playlistCopy(user, src, dest)
        if (reqId) {
          this.sendMessage(ws, types.PLAYLIST_COPY, {}, reqId)
        }
      },

      [types.PLAYLIST_MOVE]: async (ws, user, data, reqId) => {
        log.info('Renaming playlist')
        const { src, dest } = data
        await this.storage.playlistMove(user, src, dest)
        if (reqId) {
          this.sendMessage(ws, types.PLAYLIST_MOVE, {}, reqId)
        }
      },

      [types.PLAYLIST_DELETE]: async (ws, user, data, reqId) => {
        const { playlistName } = data
        log.info(`Deleting playlist: ${playlistName}`)
        await this.storage.deletePlaylist(user, playlistName)
        if (reqId) {
          this.sendMessage(ws, types.PLAYLIST_DELETE, {}, reqId)
        }
      },

      [types.LIBRARY_TRACK_UPDATE]: async (ws, user, data, reqId) => {
        log.info('Updating track info')
        const { id, attr, update } = data
        const updateObj = {
          [attr]: update,
          idp: user.idp,
          idpId: user.idpId
        }
        await this.storage.updateTrack(user, id, updateObj)
        if (reqId) {
          this.sendMessage(ws, types.LIBRARY_TRACK_UPDATE, {}, reqId)
        }
      },
      [types.TRACKS_UPDATE]: async (ws, user, data, reqId) => {
        const { tracks } = data
        log.info('Importing tracks to library', tracks)
        await Promise.all(tracks.map(t =>
          ({...t, idp: user.idp, idpId: user.idpId})
        ).map(this.storage.addTrack))
        if (reqId) {
          this.sendMessage(ws, types.TRACKS_UPDATE, {}, reqId)
        }
      },
      [types.TRACKS_DELETE]: async (ws, user, data, reqId) => {
        log.info('Deleting from library')
        const { deleteIds } = data
        this.storage.deleteTracks(user, deleteIds)
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
          const { type, data, reqId } = msg

          // Verify auth before processing message
          // TODO factor out constant actions?
          // TODO factor out error message creation?
          if (!user) {
            if (type !== types.ACCOUNT_LOGIN) {
              const errMsg = `User is not logged in. Invalid message type: ${type}`
              log.error(errMsg)

              if (reqId) {
                const resp = {err: errMsg}
                this.sendMessage(ws, type, resp, reqId)
              }

              return
            }

            const { idp, token } = data
            try {
              user = await this.auth.login(idp, token)
            } catch (err) {
              const resp = {err: err.toString()}
              if (reqId) {
                this.sendMessage(ws, type, resp, reqId)
              }
              return
            }


            //const { idp, idpId, email, name } = user
            const { idpId, email, name } = user
            log.info('Client logged in:', name)
            await this.storage.getUser(idp, idpId, email, name)
            log.info('SENDING USER DATA')
            this.sendMessage(ws, type, {...user}, reqId)

            const library = await this.storage.getLibrary(user)
            this.sendMessage(ws, types.TRACKS_UPDATE, library)

            const playlists = await this.storage.getPlaylists(user)
            this.sendMessage(ws, types.PLAYLISTS_UPDATE, playlists);
            return
          }

          await this.messageMap[type](ws, user, data, reqId)

        } catch (err) {
          // TODO probably want to display type/user here...
          log.error(`Error processing message: ${err}`)
        }
      })
      ws.isAlive = true
      setTimeout(() => this.heartbeat(ws), HEARTBEAT_INTERVAL)
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
    ws.isAlive = false
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
    const raw = {type, data}
    if (reqId) {
      raw.reqId = reqId
    }

    const cooked = this.encoder.encode(raw)
    // TODO ack message?
    ws.send(cooked)
  }

  heartbeat(ws) {
    if (!ws.isAlive) {
      log.info('Finished heartbeating to client')
      return
    }
    log.info('Heartbeating to client')
    ws.ping()
    setTimeout(() => this.heartbeat(ws), HEARTBEAT_INTERVAL)
  }

  close() {
    return new Promise((resolve, reject) => {
      this.wss.close(err => err ? reject(err) : resolve())
    })
  }

}

module.exports = Server;
