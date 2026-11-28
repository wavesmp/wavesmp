import { actionTypes } from "src/actionTypes";

import { AckMessenger } from "./ackMessenger";
import { BestEffortMessenger } from "./bestEffortMessenger";
import type {
  AckedMessages,
  AckedMessageType,
  BestEffortMessages,
  BestEffortMessageType,
  PushedMessages,
  SocketMessage,
} from "./messageTypes";

const RECONNECT_TIMEOUT = 5000;

/* Handles data pushed by the server */
type PushHandler = (data: unknown) => void;

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
  connect: () => WebSocket;
  ackMsgr: AckMessenger;
  bestEffortMsgr: BestEffortMessenger;
  messageMap: Partial<Record<string, PushHandler>>;
  ws!: WebSocket;
  onConnect: (() => void) | null;
  reconnectTimeout?: ReturnType<typeof setTimeout>;
  shutdown: boolean;

  constructor(connect: () => WebSocket) {
    this.connect = connect;
    this.ackMsgr = new AckMessenger();
    this.bestEffortMsgr = new BestEffortMessenger();
    this.messageMap = {};
    this.onConnect = null;
    this.shutdown = false;

    this.reconnect();
  }

  reconnect = (): void => {
    this.ws = this.connect();
    this.ws.onclose = this.onClose;
    this.ws.onerror = this.onError;
    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;
  };

  reconnectIfClosed(): void {
    clearTimeout(this.reconnectTimeout);
    const { readyState } = this.ws;
    if (readyState === this.ws.CONNECTING || readyState === this.ws.OPEN) {
      return;
    }
    this.reconnect();
  }

  setOnLibraryUpdate(
    onLibraryUpdate: (
      lib: PushedMessages[typeof actionTypes.TRACKS_ADD],
    ) => void,
  ): void {
    /* The server is trusted to push the documented type */
    this.messageMap[actionTypes.TRACKS_ADD] = (data): void => {
      onLibraryUpdate(data as PushedMessages[typeof actionTypes.TRACKS_ADD]);
    };
  }

  setOnPlaylistsUpdate(
    onPlaylistsUpdate: (
      playlists: PushedMessages[typeof actionTypes.PLAYLISTS_UPDATE],
    ) => void,
  ): void {
    this.messageMap[actionTypes.PLAYLISTS_UPDATE] = (data): void => {
      onPlaylistsUpdate(
        data as PushedMessages[typeof actionTypes.PLAYLISTS_UPDATE],
      );
    };
  }

  setOnConnect(onConnect: (() => void) | null): void {
    this.onConnect = onConnect;
  }

  onError = (err: Event): void => {
    console.log(`Websocket encountered error: ${err.type}`);
    console.log(err);
  };

  onClose = (ev: CloseEvent): void => {
    console.log("Websocket closed");
    console.log(`Code: ${ev.code.toString()}`);
    console.log(`Reason: ${ev.reason}`);
    console.log("Reconnecting due to closed connection");
    if (!this.shutdown) {
      this.reconnectTimeout = setTimeout(this.reconnect, RECONNECT_TIMEOUT);
    }
  };

  onOpen = (): void => {
    this.ackMsgr.process(this.ws);
    this.bestEffortMsgr.process(this.ws);
    if (this.onConnect) {
      this.onConnect();
    }
  };

  async sendAckedMessage<T extends AckedMessageType>(
    type: T,
    data: AckedMessages[T]["request"],
  ): Promise<AckedMessages[T]["response"]> {
    this.reconnectIfClosed();
    /* The server is trusted to respond with the documented type */
    return this.ackMsgr.send(this.ws, { type, data });
  }

  sendBestEffortMessage<T extends BestEffortMessageType>(
    type: T,
    data: BestEffortMessages[T],
  ): void {
    this.reconnectIfClosed();
    this.bestEffortMsgr.send(this.ws, { type, data });
  }

  onMessage = (ev: MessageEvent<string>): void => {
    try {
      const msg = JSON.parse(ev.data) as SocketMessage;
      const { type, data, reqId } = msg;
      /* Ack message responses contain a reqId attribute */
      if (reqId) {
        this.ackMsgr.receive(type, data, reqId);
        return;
      }
      const handler = this.messageMap[type];
      if (handler) {
        handler(data);
        return;
      }
      console.log(`Unexpected server message: ${type}`);
    } catch (err) {
      console.log(`Error processing message: ${String(err)}`);
      console.log(err);
      if (err instanceof Error) {
        console.log(err.stack);
      }
    }
  };

  close(): void {
    this.shutdown = true;
    clearTimeout(this.reconnectTimeout);
    this.ws.close();
  }
}

export { WavesSocket };
