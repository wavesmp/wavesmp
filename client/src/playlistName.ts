import * as constants from "src/constants";

/* Minimal validation. Server also validates */
function isPlaylistNameValid(name: string): boolean {
  return name !== "" && !name.startsWith("__");
}

function isInternalPlaylist(name: string): boolean {
  return (
    name === constants.NOW_PLAYING_NAME ||
    name === constants.LIBRARY_NAME ||
    name === constants.UPLOADS_NAME
  );
}

export { isInternalPlaylist, isPlaylistNameValid };
