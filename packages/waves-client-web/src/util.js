/* Minimal validation. Server also validates */
export function isPlaylistNameValid(name) {
  return playlistSaveName !== '' && !playlistSaveName.startsWith('__')
}
