const NOW_PLAYING_NAME = "__nowplaying";
const LIBRARY_NAME = "__library";
const UPLOADS_NAME = "__upload";

/* Keep in sync with --menu-width in src/styles/constants.css */
const MENU_WIDTH = 200;

/* How long toasts are shown, in ms, unless a toast sets its timeout */
const TOAST_TIMEOUT = 3000;

const TOAST_ID_ATTR = "data-toast";
const TRACK_ID_ATTR = "data-trackid";
const INDEX_ATTR = "data-index";
const TITLE_ATTR = "data-title";
const PLAYLIST_NAME_ATTR = "data-playlistname";
const ALL_COLUMNS = [
  "Name",
  "State",
  "Time",
  "Artist",
  "Album",
  "Genre",
  "Created At",
];

const PLAYLIST_TYPE = "application/wp";

const modalTypes = {
  PLAYLIST_CLEAR: "PLAYLIST_CLEAR",
  PLAYLIST_CREATE: "PLAYLIST_CREATE",
  PLAYLIST_SAVE: "PLAYLIST_SAVE",
  PLAYLIST_SETTINGS: "PLAYLIST_SETTINGS",
  TRACKS_DELETE: "TRACKS_DELETE",
  TRACKS_UPLOAD: "TRACKS_UPLOAD",
} as const;

const menuTypes = {
  TRACK: "TRACK",
  PLAYLIST_ADD: "PLAYLIST_ADD",
  NOTIFICATIONS: "NOTIFICATIONS",
  USER_SETTINGS: "USER_SETTINGS",
} as const;

const toastTypes = {
  Success: "Success",
  Error: "Error",
} as const;

const routes = {
  defaultRoute: "/nowplaying",
  nowplaying: "/nowplaying",
  library: "/library",
  upload: "/upload",
  playlist: "/playlist/:playlist",
  playlistBase: "/playlist/",
  settings: "/settings",
};

const MENU_DATA_VALUE = "modal";
const MODAL_DATA_VALUE = "modal";
const TOGGLE_DATA_KEY = "data-toggle";

export {
  ALL_COLUMNS,
  INDEX_ATTR,
  LIBRARY_NAME,
  MENU_DATA_VALUE,
  MENU_WIDTH,
  MODAL_DATA_VALUE,
  NOW_PLAYING_NAME,
  PLAYLIST_NAME_ATTR,
  PLAYLIST_TYPE,
  TITLE_ATTR,
  TOAST_ID_ATTR,
  TOAST_TIMEOUT,
  TOGGLE_DATA_KEY,
  TRACK_ID_ATTR,
  UPLOADS_NAME,
  menuTypes,
  modalTypes,
  routes,
  toastTypes,
};
