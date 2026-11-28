import type { Playlist } from "src/types/playlistTypes";
import type { SelectorState } from "src/types/stateTypes";

const DEFAULT_SEARCH_STRING = "";

function getRowsPerPage(state: SelectorState): number | null {
  return state.account.rowsPerPage;
}

function _getPlaylist(
  state: SelectorState,
  playlistName: string,
): Playlist | null | undefined {
  const { playlists } = state.tracks;
  if (!playlists) {
    return null;
  }
  return playlists[playlistName];
}

function getPlaylistSearch(state: SelectorState, playlistName: string): string {
  const playlist = _getPlaylist(state, playlistName);
  if (!playlist) {
    return DEFAULT_SEARCH_STRING;
  }
  return playlist.search;
}

export { _getPlaylist, getPlaylistSearch, getRowsPerPage };
