import type { actionTypes } from "src/actionTypes";
import type { ServerPlaylist } from "src/types/playlistTypes";
import type { User } from "src/types/stateTypes";
import type { ServerTrack, Track } from "src/types/trackTypes";

/*
 * Messages sent to the server, and their responses. Message types are also
 * action types (see src/actionTypes), and must match the server's
 * SOT: server/src/ws_server/waves_message_types.rs (WavesMessageType)
 */
interface AckedMessages {
  [actionTypes.ACCOUNT_LOGIN]: {
    request: { token: string; idp: string };
    response: User;
  };
  [actionTypes.PLAYLIST_COPY]: {
    request: { src: string; dest: string };
    response: unknown;
  };
  [actionTypes.PLAYLIST_DELETE]: {
    request: { playlistName: string };
    response: unknown;
  };
  [actionTypes.PLAYLIST_MOVE]: {
    request: { src: string; dest: string };
    response: unknown;
  };
  [actionTypes.PLAYLIST_REORDER]: {
    request: {
      playlistName: string;
      selection: [number, string][];
      insertAt: number;
    };
    response: unknown;
  };
  [actionTypes.TRACKS_ADD]: {
    request: { tracks: Track[] };
    response: unknown;
  };
  [actionTypes.TRACKS_DELETE]: {
    request: { deleteIds: string[] };
    response: unknown;
  };
  [actionTypes.TRACKS_INFO_UPDATE]: {
    request: { id: string; key: string; value: unknown };
    response: unknown;
  };
  [actionTypes.TRACKS_REMOVE]: {
    request: { playlistName: string; selection: [number, string][] };
    response: unknown;
  };
}

type AckedMessageType = keyof AckedMessages;

/* Messages sent without waiting for a response */
interface BestEffortMessages {
  [actionTypes.PLAYLIST_ADD]: { playlistName: string; trackIds: string[] };
}

type BestEffortMessageType = keyof BestEffortMessages;

/* Messages pushed by the server */
interface PushedMessages {
  [actionTypes.TRACKS_ADD]: ServerTrack[];
  [actionTypes.PLAYLISTS_UPDATE]: ServerPlaylist[];
}

/* A message as sent over the socket. reqId is set for acked messages */
interface SocketMessage {
  type: string;
  data: unknown;
  reqId?: number;
}

export type {
  AckedMessages,
  AckedMessageType,
  BestEffortMessages,
  BestEffortMessageType,
  PushedMessages,
  SocketMessage,
};
