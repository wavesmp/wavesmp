const keyMirror = require('keymirror')

const constants = {}

constants.NOW_PLAYING_NAME = '__nowplaying'
constants.LIBRARY_NAME = '__library'
constants.UPLOADS_NAME = '__upload'

constants.TOAST_ID_ATTR = 'data-toast'
constants.TRACK_ID_ATTR = 'data-trackid'
constants.INDEX_ATTR = 'data-index'
constants.TITLE_ATTR = 'data-title'
constants.PLAYLIST_NAME_ATTR = 'data-playlistname'
constants.ALL_COLUMNS = [
  'Name',
  'State',
  'Time',
  'Artist',
  'Album',
  'Genre',
  'Created At'
]

constants.PLAYLIST_TYPE = 'application/wp'

constants.libTypes = keyMirror({
  UPLOADS: null,
  WAVES: null
})

constants.modalTypes = keyMirror({
  PLAYLIST_CLEAR: null,
  PLAYLIST_CREATE: null,
  PLAYLIST_SAVE: null,
  PLAYLIST_SETTINGS: null,
  TRACKS_DELETE: null,
  TRACKS_UPLOAD: null
})

constants.contextmenuTypes = keyMirror({
  TRACK: null,
  PLAYLIST_ADD: null
})

constants.dropdownTypes = keyMirror({
  USER_SETTINGS: null,
  NOTIFICATIONS: null
})

constants.toastTypes = keyMirror({
  Success: null,
  Error: null
})

constants.routes = {
  defaultRoute: '/nowplaying',
  nowplaying: '/nowplaying',
  library: '/library',
  upload: '/upload',
  playlist: '/playlist/:playlist',
  playlistBase: '/playlist/',
  settings: '/settings'
}

constants.DROPDOWN_DATA_VALUE = 'dropdown'
constants.MODAL_DATA_VALUE = 'modal'
constants.TOGGLE_DATA_KEY = 'data-toggle'

module.exports = constants
