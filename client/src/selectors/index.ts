import { LIBRARY_NAME, NOW_PLAYING_NAME } from "src/constants";
import type { SelectorState } from "src/types/stateTypes";

import { getPlaylistSearch } from "./base";
import type { PlaylistProps, PlaylistSelectors } from "./playlist";
import { getOrCreatePlaylistSelectors, getPlaylistSelectors } from "./playlist";
import { getFilteredSelection, removeSelection } from "./selection";

function getLibraryPlaylistSearch(state: SelectorState): string {
  return getPlaylistSearch(state, LIBRARY_NAME);
}

function getDefaultPlaylistSearch(state: SelectorState): string {
  return getPlaylistSearch(state, NOW_PLAYING_NAME);
}

export {
  getDefaultPlaylistSearch,
  getFilteredSelection,
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors,
  getPlaylistSearch,
  getPlaylistSelectors,
  removeSelection,
};
export type { PlaylistProps, PlaylistSelectors };
