const keyMirror = require('keymirror')

const constants = {}

constants.DEFAULT_PLAYLIST = '__nowplaying'
constants.FULL_PLAYLIST = '__library'
constants.UPLOAD_PLAYLIST = '__upload'

constants.TOAST_ID_ATTR = 'data-toast'
constants.TRACK_ID_ATTR = 'data-trackid'
constants.PLAY_INDEX_ATTR = 'data-playindex'
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

constants.iconPlayColor = '#52CA19'
constants.iconPauseColor = '#F17B10'
constants.iconAddColor = '#4aa3df'
constants.iconRemoveColor = '#C11313'
constants.iconDeleteColor = '#696969'
constants.iconDownloadColor = '#505050'
constants.iconBackColor = '#4aa3df'

constants.modalTypes = keyMirror({
  ACTION_CONFIRM: null,
  PLAYLIST_CREATE: null,
  PLAYLIST_SAVE: null,
  PLAYLIST_SETTINGS: null,
  SETTINGS: null,
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
  playlist: '/playlist/:playlist'
}

constants.DROPDOWN_DATA_VALUE = 'dropdown'
constants.MODAL_DATA_VALUE = 'modal'
constants.TOGGLE_DATA_KEY = 'data-toggle'

module.exports = constants
