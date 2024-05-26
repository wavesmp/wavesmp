const types = require('waves-action-types')

const AckMessenger = require('./ackMessenger')
const BestEffortMessenger = require('./bestEffortMessenger')

const RECONNECT_TIMEOUT = 5000

/* Wraps a given WebSocket connection to a Waves server.
 *
 * Supports two types of messages.
 * - Best effort: function returns void
 *   - Sends message when connection is stable
 *   - Will not wait for server to acknowledge
 *
 * - Acknowledged: async function
 *   - Sends message when connection is stable, up to a timeout
 *   - If message is sent, waits (up to a timeout) for server acknowledgement
 *   - Returns an error if a timeout is reached
 *   - Otherwise, returns server response
 */
class WavesSocket {
  constructor(connect) {
    this.connect = connect

    this.ackMsgr = new AckMessenger()
    this.bestEffortMsgr = new BestEffortMessenger()

    this.messageMap = {}

    this.onClose = this.onClose.bind(this)
    this.onError = this.onError.bind(this)
    this.onOpen = this.onOpen.bind(this)
    this.onMessage = this.onMessage.bind(this)
    this.reconnect = this.reconnect.bind(this)

    this.reconnect()
  }

  reconnect() {
    this.ws = this.connect()
    this.ws.onclose = this.onClose
    this.ws.onerror = this.onError
    this.ws.onopen = this.onOpen
    this.ws.onmessage = this.onMessage
  }

  reconnectIfClosed() {
    clearTimeout(this.reconnectTimeout)
    const { readyState } = this.ws
    if (readyState === this.ws.CONNECTING || readyState === this.ws.OPEN) {
      return
    }
    this.reconnect()
  }

  setOnLibraryUpdate(onLibraryUpdate) {
    this.messageMap[types.TRACKS_ADD] = onLibraryUpdate
  }

  setOnPlaylistsUpdate(onPlaylistsUpdate) {
    this.messageMap[types.PLAYLISTS_UPDATE] = onPlaylistsUpdate
  }

  setOnConnect(onConnect) {
    this.onConnect = onConnect
  }

  onError(err) {
    console.log(`Websocket encountered error: ${err}`)
    console.log(err)
  }

  onClose(ev) {
    console.log('Websocket closed')
    console.log(`Code: ${ev.code}`)
    console.log(`Reason: ${ev.reason}`)

    console.log('Reconnecting due to closed connection')
    if (!this.shutdown) {
      this.reconnectTimeout = setTimeout(this.reconnect, RECONNECT_TIMEOUT)
    }
  }

  onOpen() {
    this.ackMsgr.process(this.ws)
    this.bestEffortMsgr.process(this.ws)
    if (this.onConnect) {
      this.onConnect()
    }
  }

  async sendAckedMessage(type, data) {
    this.reconnectIfClosed()
    return this.ackMsgr.send(this.ws, { type, data })
  }

  sendBestEffortMessage(type, data) {
    this.reconnectIfClosed()
    this.bestEffortMsgr.send(this.ws, { type, data })
  }

  onMessage(ev) {
    try {
      const msg = JSON.parse(ev.data)
      const { type, data, reqId } = msg

      /* Ack message responses contain a reqId attribute */
      if (reqId) {
        this.ackMsgr.receive(type, data, reqId)
        return
      }

      if (this.messageMap[type]) {
        this.messageMap[type](data)
        return
      }

      console.log(`Unexpected server message: ${type}`)
    } catch (err) {
      console.log(`Error processing message: ${err}`)
      console.log(err)
      console.log(err.stack)
    }
  }

  close() {
    this.shutdown = true
    clearTimeout(this.reconnectTimeout)
    this.ws.close()
  }
}

module.exports = WavesSocket
