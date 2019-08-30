import constants from 'waves-client-constants'

/* Minimal validation. Server also validates */
export function isPlaylistNameValid(name) {
  return name !== '' && !name.startsWith('__')
}

export function isInternalPlaylist(name) {
  return (
    name === constants.NOW_PLAYING_NAME ||
    name === constants.LIBRARY_NAME ||
    name === constants.UPLOADS_NAME
  )
}
