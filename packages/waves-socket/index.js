const Encoder = require('waves-encoder')
const types = require('waves-action-types')

const AckMessenger = require('./ackMessenger')
const BestEffortMessenger = require('./bestEffortMessenger')

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
  constructor(ws) {
    this.ws = ws

    this.ackMsgr = new AckMessenger()
    this.bestEffortMsgr = new BestEffortMessenger()
    this.encoder = new Encoder()

    this.ws.onclose = this.onClose
    this.ws.onerror = this.onError
    this.ws.onopen = this.onOpen.bind(this)
    this.ws.onmessage = this.onMessage.bind(this)

    this.messageMap = {}
  }

  setOnLibraryUpdate(onLibraryUpdate) {
    this.messageMap[types.TRACKS_UPDATE] = onLibraryUpdate
  }

  setOnPlaylistsUpdate(onPlaylistsUpdate) {
    this.messageMap[types.PLAYLISTS_UPDATE] = onPlaylistsUpdate
  }

  onError(err) {
    console.log(`Websocket encountered error: ${err}`)
    console.log(err)
  }

  onClose(ev) {
    console.log('Websocket closed')
    console.log(`Code: ${ev.code}`)
    console.log(`Reason: ${ev.reason}`)
  }

  onOpen(err) {
    this.ackMsgr.process(this.ws)
    this.bestEffortMsgr.process(this.ws)
  }

  async sendAckedMessage(type, data) {
    return await this.ackMsgr.send(this.ws, { type, data })
  }

  sendBestEffortMessage(type, data) {
    this.bestEffortMsgr.send(this.ws, { type, data })
  }

  onMessage(ev) {
    try {
      const msg = this.encoder.decode(ev.data)
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
}

module.exports = WavesSocket
