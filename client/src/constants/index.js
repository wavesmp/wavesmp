import keyMirror from "keymirror";

const NOW_PLAYING_NAME = "__nowplaying";
const LIBRARY_NAME = "__library";
const UPLOADS_NAME = "__upload";

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

const modalTypes = keyMirror({
  PLAYLIST_CLEAR: null,
  PLAYLIST_CREATE: null,
  PLAYLIST_SAVE: null,
  PLAYLIST_SETTINGS: null,
  TRACKS_DELETE: null,
  TRACKS_UPLOAD: null,
});

const menuTypes = keyMirror({
  TRACK: null,
  PLAYLIST_ADD: null,
  NOTIFICATIONS: null,
  USER_SETTINGS: null,
});

const toastTypes = keyMirror({
  Success: null,
  Error: null,
});

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
  MODAL_DATA_VALUE,
  NOW_PLAYING_NAME,
  PLAYLIST_NAME_ATTR,
  PLAYLIST_TYPE,
  TITLE_ATTR,
  TOAST_ID_ATTR,
  TOGGLE_DATA_KEY,
  TRACK_ID_ATTR,
  UPLOADS_NAME,
  menuTypes,
  modalTypes,
  routes,
  toastTypes,
};
