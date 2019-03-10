/* Minimal validation. Server also validates */
export function isPlaylistNameValid(name) {
  return name !== '' && !name.startsWith('__')
}

export function isInternalPlaylist(name) {
  return (
    playlist === constants.DEFAULT_PLAYLIST ||
    playlist === constants.FULL_PLAYLIST ||
    playlist === constants.UPLOAD_PLAYLIST
  )
}
