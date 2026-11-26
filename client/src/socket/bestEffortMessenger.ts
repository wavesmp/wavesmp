import type { SocketMessage } from "./messageTypes";

class BestEffortMessenger {
  /* Keep best effort messages until connection is stable */
  messages: string[];

  constructor() {
    this.messages = [];
  }

  /* Should be called when connection is open */
  process(ws: WebSocket): void {
    for (const msg of this.messages) {
      ws.send(msg);
    }
  }

  /* Send the message if the connection is open.
   * Otherwise, save the message for later. */
  send(ws: WebSocket, message: SocketMessage): void {
    const data = JSON.stringify(message);
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    } else {
      this.messages.push(data);
    }
  }
}

export { BestEffortMessenger };
