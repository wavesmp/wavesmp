import { LIBRARY_NAME, UPLOADS_NAME } from "src/constants";

function getLibNameForPlaylistName(playlistName: string): string {
  if (playlistName === UPLOADS_NAME) {
    return UPLOADS_NAME;
  }
  return LIBRARY_NAME;
}

export { getLibNameForPlaylistName };
