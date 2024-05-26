const keyMirror = require('keymirror')

const actionTypes = keyMirror({
  MENU_BACK: null,
  MENU_NEXT: null,
  MENU_RESET: null,
  MENU_SET: null,

  ACCOUNT_LOGIN: null,
  ACCOUNT_SET_FETCHING_USER: null,
  ACCOUNT_SET_SETTINGS: null,

  ERR: null,

  MENUBAR_SET: null,

  MODAL_SET: null,

  SIDEBAR_SET: null,

  LAYOUT_SET: null,

  PLAYING_PLAY: null,
  PLAYING_PAUSE: null,
  PLAYING_REPEAT_TOGGLE: null,
  PLAYING_SHUFFLE_TOGGLE: null,
  PLAYING_TRACK_REPEAT: null,

  TRACKS_DELETE: null,
  TRACKS_INFO_UPDATE: null,
  TRACKS_ADD: null,
  TRACKS_REMOVE: null,
  TRACK_NEXT: null,
  TRACK_TOGGLE: null,

  SELECTION_ADD: null,
  SELECTION_CLEAR_AND_ADD: null,
  SELECTION_REMOVE: null,
  SELECTION_RANGE: null,

  PLAYLIST_SEARCH_UPDATE: null,
  PLAYLISTS_UPDATE: null,
  PLAYLIST_COPY: null,
  PLAYLIST_SORT: null,
  PLAYLIST_ADD: null,
  PLAYLIST_DELETE: null,
  PLAYLIST_MOVE: null,
  PLAYLIST_REORDER: null,

  TOAST_ADD: null,
  TOAST_REMOVE: null,
})

module.exports = actionTypes
