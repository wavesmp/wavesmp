const Encoder = require('waves-encoder')

class BestEffortMessenger {
  constructor() {
    /* Keep best effort messages until connection is stable */
    this.messages = []
    this.encoder = new Encoder()
  }

  /* Should be called when connection is open */
  process(ws) {
    for (const msg of this.messages) {
      ws.send(msg)
    }
  }

  /* Send the message if the connection is open.
   * Otherwise, save the message for later. */
  send(ws, data) {
    data = this.encoder.encode(data)
    if (ws.readyState === ws.OPEN) {
      ws.send(data)
    } else {
      this.messages.push(data)
    }
  }

}

module.exports = BestEffortMessenger
