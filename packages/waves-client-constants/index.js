const keyMirror = require('keymirror')

const constants = {}

constants.DEFAULT_PLAYLIST = '__nowplaying'
constants.FULL_PLAYLIST = '__library'
constants.UPLOAD_PLAYLIST = '__upload'

constants.TRACK_ID_ATTR = 'data-trackid'
constants.PLAY_INDEX_ATTR = 'data-playindex'
constants.PLAYLIST_NAME_ATTR = 'data-playlistname'
constants.ALL_COLUMNS = ['Name', 'State', 'Time', 'Artist', 'Album', 'Genre']

constants.iconPlayColor = '#52CA19'
constants.iconPauseColor = '#F17B10'
constants.iconAddColor = '#4aa3df'
constants.iconRemoveColor = '#C11313'
constants.iconDeleteColor = '#696969'
constants.iconDownloadColor = '#505050'
constants.iconBackColor = '#4aa3df'

constants.modalTypes = keyMirror({
  TRACKS_DELETE: null,
  ACTION_CONFIRM: null,
  PLAYLIST_SAVE: null,
  PLAYLIST_SETTINGS: null,
  SETTINGS: null,
})

constants.contextmenuTypes = keyMirror({
  TRACK: null,
  PLAYLIST_ADD: null,
})

module.exports = constants
