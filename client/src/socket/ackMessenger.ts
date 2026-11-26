import type { SocketMessage } from "./messageTypes";

const ACK_MESSAGE_SEND_TIMEOUT = 15000;
const ACK_MESSAGE_RECEIVE_TIMEOUT = 15000;

interface AckMessage {
  data: string;
  sentResolve?: () => void;
  sentTimeout?: ReturnType<typeof setTimeout>;
  receivedResolve?: (data: unknown) => void;
  receivedReject?: (err: Error) => void;
  receivedTimeout?: ReturnType<typeof setTimeout>;
}

class AckMessenger {
  reqId: number;
  ackMessages: Map<number, AckMessage>;

  constructor() {
    this.reqId = 1;
    this.ackMessages = new Map();
  }

  process(ws: WebSocket): void {
    for (const ackMessage of this.ackMessages.values()) {
      if (ackMessage.sentResolve) {
        ws.send(ackMessage.data);
        clearTimeout(ackMessage.sentTimeout);
        ackMessage.sentResolve();
      }
    }
  }

  /* Resolves with the server response data */
  async send(ws: WebSocket, message: SocketMessage): Promise<unknown> {
    const { reqId } = this;
    message.reqId = reqId;
    this.reqId += 1;
    const data = JSON.stringify(message);
    const ackMessage: AckMessage = { data };
    this.ackMessages.set(reqId, ackMessage);

    let sentPromise: Promise<void>;
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
      sentPromise = Promise.resolve();
    } else {
      sentPromise = new Promise((resolve, reject) => {
        ackMessage.sentResolve = resolve;
        ackMessage.sentTimeout = setTimeout(() => {
          this.ackMessages.delete(reqId);
          reject(new Error(`Message ${reqId.toString()} not sent in time`));
        }, ACK_MESSAGE_SEND_TIMEOUT);
      });
    }
    await sentPromise;
    return new Promise((resolve, reject) => {
      ackMessage.receivedResolve = resolve;
      ackMessage.receivedReject = reject;
      ackMessage.receivedTimeout = setTimeout(() => {
        this.ackMessages.delete(reqId);
        reject(new Error(`Message ${reqId.toString()} not received in time`));
      }, ACK_MESSAGE_RECEIVE_TIMEOUT);
    });
  }

  receive(type: string, data: unknown, reqId: number): void {
    const ackMessage = this.ackMessages.get(reqId);
    this.ackMessages.delete(reqId);
    if (!ackMessage) {
      /* Received a response for an unknown request. The request
       * may have timed out, which would have reported an error
       * to the caller. */
      console.log(
        `Unexpected server message for request ${reqId.toString()}: ${type}`,
      );
      return;
    }
    clearTimeout(ackMessage.receivedTimeout);
    const err = getErr(data);
    if (err !== undefined) {
      ackMessage.receivedReject?.(new Error(err));
    } else {
      ackMessage.receivedResolve?.(data);
    }
  }
}

/* Server errors are sent as { err } */
function getErr(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("err" in data)) {
    return undefined;
  }
  const { err } = data;
  if (!err) {
    return undefined;
  }
  return typeof err === "string" ? err : JSON.stringify(err);
}

export { AckMessenger };
