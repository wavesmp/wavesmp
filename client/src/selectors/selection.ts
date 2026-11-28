import type { Selection } from "src/types/playlistTypes";
import type { SelectorState } from "src/types/stateTypes";
import { filterSelection } from "src/utils";

import { getPlaylistSearch } from "./base";
import type { PlaylistProps } from "./playlist";
import { getPlaylistSelectors } from "./playlist";

/* The props of a loaded playlist. Its selectors must have been created
 * (see getOrCreatePlaylistSelectors) */
function getLoadedPlaylistProps(
  state: SelectorState,
  playlistName: string,
): Extract<PlaylistProps, { loaded: true }> {
  const search = getPlaylistSearch(state, playlistName);
  const selectors = getPlaylistSelectors(playlistName);
  if (!selectors) {
    throw new Error(`No selectors for playlist: ${playlistName}`);
  }
  const props = selectors.getPlaylistProps(state, search);
  if (!props.loaded) {
    throw new Error(`Playlist is not loaded: ${playlistName}`);
  }
  return props;
}

/* The selected items that are displayed */
function getFilteredSelection(
  state: SelectorState,
  playlistName: string,
): Selection {
  const { selection, displayItems } = getLoadedPlaylistProps(
    state,
    playlistName,
  );
  return filterSelection(displayItems, selection);
}

interface RemovedSelection {
  /* Playing index before removing */
  oldIndex: number | null;
  /* Playing index after removing */
  index: number | null;
  removedSelection: Selection;
  updatedSelection: Selection;
}

/* Splits the selection into the displayed items, which are removed, and the
 * rest, with indexes updated for the removal */
function removeSelection(
  state: SelectorState,
  playlistName: string,
): RemovedSelection {
  const {
    selection,
    displayItems,
    index: oldPlaylistIndex,
  } = getLoadedPlaylistProps(state, playlistName);
  let playlistIndex = oldPlaylistIndex;
  const indexes = Array.from(selection.keys());
  indexes.sort((a, b) => a - b);
  const displayIndexes = new Set(displayItems.map((item) => item.index));
  const removedSelection: Selection = new Map();
  const updatedSelection: Selection = new Map();
  let numRemoved = 0;
  let playlistIndexOffset = 0;
  for (const index of indexes) {
    const trackId = selection.get(index);
    if (trackId === undefined) {
      continue;
    }
    if (displayIndexes.has(index)) {
      removedSelection.set(index, trackId);
      numRemoved += 1;
      if (playlistIndex != null) {
        if (index === playlistIndex) {
          playlistIndex = null;
        } else if (index < playlistIndex) {
          playlistIndexOffset += 1;
        }
      }
    } else {
      updatedSelection.set(index - numRemoved, trackId);
    }
  }
  if (playlistIndex) {
    playlistIndex -= playlistIndexOffset;
  }
  return {
    oldIndex: oldPlaylistIndex,
    index: playlistIndex,
    removedSelection,
    updatedSelection,
  };
}

export { getFilteredSelection, removeSelection };
