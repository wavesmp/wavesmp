import { LIBRARY_NAME, NOW_PLAYING_NAME } from "src/constants";

import { getPlaylistSearch } from "./base";
import { getOrCreatePlaylistSelectors, getPlaylistSelectors } from "./playlist";
import { getFilteredSelection, removeSelection } from "./selection";

function getLibraryPlaylistSearch(state) {
  return getPlaylistSearch(state, LIBRARY_NAME);
}

function getDefaultPlaylistSearch(state) {
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
