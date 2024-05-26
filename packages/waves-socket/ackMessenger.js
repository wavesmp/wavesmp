const ACK_MESSAGE_SEND_TIMEOUT = 15000
const ACK_MESSAGE_RECEIVE_TIMEOUT = 15000

class AckMessenger {
  constructor() {
    this.reqId = 1
    this.ackMessages = {}
  }

  process(ws) {
    for (const reqId in this.ackMessages) {
      const ackMessage = this.ackMessages[reqId]

      if (ackMessage.sentResolve) {
        ws.send(ackMessage.data)
        clearTimeout(ackMessage.sentTimeout)
        ackMessage.sentResolve()
      }
    }
  }

  async send(ws, data) {
    const { reqId } = this
    data.reqId = reqId
    this.reqId += 1

    data = JSON.stringify(data)
    this.ackMessages[reqId] = { data }

    let sentPromise
    if (ws.readyState === ws.OPEN) {
      ws.send(data)
      sentPromise = Promise.resolve()
    } else {
      sentPromise = new Promise((resolve, reject) => {
        this.ackMessages[reqId].sentResolve = resolve
        this.ackMessages[reqId].sentTimeout = setTimeout(() => {
          delete this.ackMessages[reqId]
          reject(new Error(`Message ${reqId} not sent in time`))
        }, ACK_MESSAGE_SEND_TIMEOUT)
      })
    }

    return sentPromise.then(() => {
      const receivedPromise = new Promise((resolve, reject) => {
        this.ackMessages[reqId].receivedResolve = resolve
        this.ackMessages[reqId].receivedReject = reject
        this.ackMessages[reqId].receivedTimeout = setTimeout(() => {
          delete this.ackMessages[reqId]
          reject(new Error(`Message ${reqId} not received in time`))
        }, ACK_MESSAGE_RECEIVE_TIMEOUT)
      })
      return receivedPromise
    })
  }

  receive(type, data, reqId) {
    const ackMessage = this.ackMessages[reqId]
    delete this.ackMessages[reqId]
    if (!ackMessage) {
      /* Received a response for an unknown request. The request
       * may have timed out, which would have reported an error
       * to the caller. */
      console.log(`Unexpected server message for request ${reqId}: ${type}`)
      return
    }

    clearTimeout(ackMessage.receivedTimeout)
    if (data.err) {
      ackMessage.receivedReject(new Error(data.err))
    } else {
      ackMessage.receivedResolve(data)
    }
  }
}

module.exports = AckMessenger
