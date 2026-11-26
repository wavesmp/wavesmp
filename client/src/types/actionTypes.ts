import type { actionTypes } from "src/actionTypes";
import type { Auth } from "src/auth";
import type { LocalState } from "src/localState";
import type { Player } from "src/player";
import type { WavesSocket } from "src/socket";

import type { Selection, ServerPlaylist } from "./playlistTypes";
import type {
  AccountSettings,
  Layout,
  Menu,
  Modal,
  State,
  Toast,
  User,
} from "./stateTypes";
import type { Library, NormalizedTrack, Track } from "./trackTypes";

type ActionTypes = typeof actionTypes;

/* Track info that can be updated */
type TrackInfo = Pick<
  Track,
  "title" | "artist" | "album" | "genre" | "state" | "uploadProgress"
>;
type TrackInfoUpdate = {
  [K in keyof TrackInfo]-?: { key: K; value: TrackInfo[K] };
}[keyof TrackInfo];

/* An item displayed in a playlist, identified by index and track id */
interface DisplayItem {
  index: number;
  id: string;
}

type WavesAction =
  | { type: ActionTypes["MENU_BACK"] }
  | { type: ActionTypes["MENU_NEXT"]; menu: Menu }
  | { type: ActionTypes["MENU_RESET"] }
  | { type: ActionTypes["MENU_SET"]; menu: Menu }
  | { type: ActionTypes["ACCOUNT_LOGIN"]; user: User | null }
  | { type: ActionTypes["ACCOUNT_SET_FETCHING_USER"]; fetchingUser: boolean }
  | { type: ActionTypes["ACCOUNT_SET_SETTINGS"]; settings: AccountSettings }
  | { type: ActionTypes["ERR"]; err: unknown }
  | { type: ActionTypes["MENUBAR_SET"]; menubar: boolean }
  | { type: ActionTypes["MODAL_SET"]; modal: Modal | null }
  | { type: ActionTypes["SIDEBAR_SET"]; sidebar: boolean }
  | { type: ActionTypes["LAYOUT_SET"]; layout: Layout }
  | { type: ActionTypes["PLAYING_PLAY"] }
  | { type: ActionTypes["PLAYING_PAUSE"] }
  | { type: ActionTypes["PLAYING_REPEAT_TOGGLE"] }
  | { type: ActionTypes["PLAYING_SHUFFLE_TOGGLE"] }
  | {
      type: ActionTypes["TRACKS_DELETE"];
      deleteIds: Set<string>;
      libName: string;
    }
  | ({
      type: ActionTypes["TRACKS_INFO_UPDATE"];
      ids: string[];
      libName: string;
    } & TrackInfoUpdate)
  | { type: ActionTypes["TRACKS_ADD"]; lib: Library; libName: string }
  | {
      type: ActionTypes["TRACKS_REMOVE"];
      playlistName: string;
      deleteIndexes: number[];
      selection: Selection;
      index: number | null;
      deletePlaying: boolean;
    }
  | {
      type: ActionTypes["TRACK_NEXT"];
      nextTrack: NormalizedTrack | null;
      playlistName: string;
    }
  | {
      type: ActionTypes["TRACK_TOGGLE"];
      playlistName: string;
      index: number;
      track: Track;
      oldPlaylistName: string | null;
    }
  | {
      type: ActionTypes["SELECTION_ADD"];
      name: string;
      index: number;
      trackId: string;
    }
  | {
      type: ActionTypes["SELECTION_CLEAR_AND_ADD"];
      name: string;
      index: number;
      trackId: string;
      displayItems: readonly DisplayItem[];
    }
  | { type: ActionTypes["SELECTION_REMOVE"]; name: string; index: number }
  | {
      type: ActionTypes["SELECTION_RANGE"];
      name: string;
      startIndex: number;
      endIndex: number;
      displayItems: readonly DisplayItem[];
    }
  | {
      type: ActionTypes["PLAYLIST_SEARCH_UPDATE"];
      name: string;
      search: string;
    }
  | { type: ActionTypes["PLAYLISTS_UPDATE"]; update: ServerPlaylist[] }
  | { type: ActionTypes["PLAYLIST_COPY"]; src: string; dest: string }
  | {
      type: ActionTypes["PLAYLIST_SORT"];
      lib: Library | null | undefined;
      name: string;
      sortKey: string;
      ascending: boolean;
    }
  | {
      type: ActionTypes["PLAYLIST_ADD"];
      playlistName: string;
      addTracks: string[];
    }
  | { type: ActionTypes["PLAYLIST_DELETE"]; playlistName: string }
  | { type: ActionTypes["PLAYLIST_MOVE"]; src: string; dest: string }
  | {
      type: ActionTypes["PLAYLIST_REORDER"];
      playlistName: string;
      reordered: string[];
      newSelection: Selection;
      newIndex: number | null;
    }
  | { type: ActionTypes["TOAST_ADD"]; toast: Toast }
  | { type: ActionTypes["TOAST_REMOVE"]; id: number };

/* Sent once, to build the initial state */
interface InitAction {
  type: "@@waves/INIT";
}

type ReducerAction = WavesAction | InitAction;

type Reducer<S> = (state: S | undefined, action: ReducerAction) => S;

/* The side effect objects passed to thunks */
interface ExtraArgument {
  localState: LocalState;
  player: Player;
  ws: WavesSocket;
  auth: Auth;
}

type GetState = () => State;

/* An action creator's thunk, run by dispatch */
type Thunk<R> = (
  dispatch: Dispatch,
  getState: GetState,
  extra: ExtraArgument,
) => R;

interface Dispatch {
  <A extends WavesAction>(action: A): A;
  <R>(thunk: Thunk<R>): R;
}

export type {
  Dispatch,
  DisplayItem,
  ExtraArgument,
  GetState,
  InitAction,
  Reducer,
  ReducerAction,
  Thunk,
  TrackInfo,
  TrackInfoUpdate,
  WavesAction,
};
