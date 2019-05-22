const keyMirror = require('keymirror')

const actionTypes = keyMirror({
  CONTEXTMENU_BACK: null,
  CONTEXTMENU_NEXT: null,
  CONTEXTMENU_RESET: null,
  CONTEXTMENU_SET: null,

  ACCOUNT_LOGIN: null,
  ACCOUNT_SET_FETCHING_USER: null,
  ACCOUNT_SET_SETTINGS: null,

  ERR: null,

  DROPDOWN_SET: null,

  MODAL_SET: null,

  SIDEBAR_MODE_SET: null,

  TRANSITION_MAIN_SET: null,

  LIBRARY_TRACK_UPDATE: null,

  PLAYING_PLAY: null,
  PLAYING_PAUSE: null,
  PLAYING_REPEAT_TOGGLE: null,
  PLAYING_SHUFFLE_TOGGLE: null,
  PLAYING_TRACK_REPEAT: null,

  TRACKS_DELETE: null,
  TRACKS_REMOVE: null,
  TRACKS_UPDATE: null,
  TRACK_NEXT: null,
  TRACK_TOGGLE: null,
  TRACK_UPLOADS_DELETE: null,
  TRACK_UPLOADS_UPDATE: null,

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

  TOAST_ADD: null,
  TOAST_REMOVE: null,

  UPLOAD_TRACKS_UPDATE: null
})

module.exports = actionTypes
