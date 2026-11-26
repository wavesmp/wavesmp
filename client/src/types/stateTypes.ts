import type { menuTypes, modalTypes, toastTypes } from "src/constants";

import type { Playlists } from "./playlistTypes";
import type { Libraries, NormalizedTrack, Track } from "./trackTypes";

/*
 * A signed in user.
 * SOT: server/src/ws_server/waves_message_types.rs (WavesUserExternal)
 */
interface User {
  idpId: string;
  name?: string | null;
  email?: string | null;
}

type Theme = "light" | "dark";

interface Account {
  columns: Set<string> | null;
  rowsPerPage: number | null;
  user: User | null;
  fetchingUser: boolean;
  theme: string;
}

/* Settings stored in localStorage */
interface AccountSettings {
  columns?: Set<string>;
  rowsPerPage?: number;
  theme?: string;
}

interface Playing {
  isPlaying: boolean;
  playlist: string | null;
  track: NormalizedTrack | Track | null;
  shuffle: boolean;
  repeat: boolean;
}

type MenuType = (typeof menuTypes)[keyof typeof menuTypes];

/* Props given to the menu components */
interface MenuProps {
  itemIndex?: number;
  trackId?: string;
  bulk?: boolean;
  playlistName?: string;
  index?: number | null;
  /* The playlist to add tracks from (PLAYLIST_ADD menu) */
  currentPlaylist?: string;
}

interface Menu {
  type: MenuType;
  /* css transform to position the menu */
  transform?: string;
  props?: MenuProps;
}

type ModalType = (typeof modalTypes)[keyof typeof modalTypes];

/* Props given to the modal components */
interface ModalProps {
  playlistName?: string;
  playlistSrc?: string;
}

interface Modal {
  type: ModalType;
  props?: ModalProps;
}

type ToastType = (typeof toastTypes)[keyof typeof toastTypes];

interface Toast {
  id?: number;
  type: ToastType;
  msg: string;
  timeout?: number;
}

interface TracksState {
  libraries: Libraries;
  playlists: Playlists;
  playing: Playing;
}

/* Controls the layout
 * - 0: < 516px
 * - 1: < 768px
 * - 2: anything greater */
type Layout = 0 | 1 | 2;

interface State {
  account: Account;
  err: unknown;
  layout: Layout;
  menu: Menu[];
  /* false: track player. true: track options */
  menubar: boolean;
  modal: Modal | null;
  /* false: main sidebar. true: playlists sidebar */
  sidebar: boolean;
  toasts: Toast[];
  tracks: TracksState;
}

/* The part of the state read by the selectors */
interface SelectorState {
  account: Pick<Account, "rowsPerPage">;
  tracks: Pick<TracksState, "libraries" | "playlists">;
}

export type {
  Account,
  AccountSettings,
  Layout,
  Menu,
  MenuProps,
  MenuType,
  Modal,
  ModalProps,
  ModalType,
  Playing,
  SelectorState,
  State,
  Theme,
  Toast,
  ToastType,
  TracksState,
  User,
};
