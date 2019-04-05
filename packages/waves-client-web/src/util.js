import constants from 'waves-client-constants'

/* Minimal validation. Server also validates */
export function isPlaylistNameValid(name) {
  return name !== '' && !name.startsWith('__')
}

export function isInternalPlaylist(name) {
  return (
    name === constants.DEFAULT_PLAYLIST ||
    name === constants.FULL_PLAYLIST ||
    name === constants.UPLOAD_PLAYLIST
  )
}
