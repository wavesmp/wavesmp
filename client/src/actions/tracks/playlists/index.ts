import { actionTypes } from "src/actionTypes";
import { LIBRARY_NAME } from "src/constants";
import {
  getFilteredSelection,
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors,
} from "src/selectors";
import type { Thunk, WavesAction } from "src/types/actionTypes";
import type { ServerPlaylist } from "src/types/playlistTypes";

import { reorder } from "./reorder";

function playlistsUpdate(
  update: ServerPlaylist[],
): Extract<WavesAction, { type: typeof actionTypes.PLAYLISTS_UPDATE }> {
  return { type: actionTypes.PLAYLISTS_UPDATE, update };
}

function playlistCopy(src: string, dest: string): Thunk<Promise<void>> {
  return async (dispatch, _getState, { ws }) => {
    await ws.sendAckedMessage(actionTypes.PLAYLIST_COPY, { src, dest });
    dispatch({ type: actionTypes.PLAYLIST_COPY, src, dest });
  };
}

function playlistDelete(playlistName: string): Thunk<Promise<void>> {
  return async (dispatch, _getState, { ws }) => {
    await ws.sendAckedMessage(actionTypes.PLAYLIST_DELETE, { playlistName });
    dispatch({ type: actionTypes.PLAYLIST_DELETE, playlistName });
  };
}

function playlistMove(src: string, dest: string): Thunk<Promise<void>> {
  return async (dispatch, _getState, { ws }) => {
    await ws.sendAckedMessage(actionTypes.PLAYLIST_MOVE, { src, dest });
    dispatch({ type: actionTypes.PLAYLIST_MOVE, src, dest });
  };
}

function playlistAdd(source: string, dest: string): Thunk<void> {
  return (dispatch, getState, { ws }) => {
    console.log(`Adding from playlist ${source} to ${dest}`);

    const selection = getFilteredSelection(getState(), source);
    const addIndexes = Array.from(selection.keys());
    addIndexes.sort((a, b) => a - b);

    /* Indexes come from the selection, so each has a track id */
    const addTracks = addIndexes.flatMap((addIndex) => {
      const trackId = selection.get(addIndex);
      return trackId === undefined ? [] : [trackId];
    });

    dispatch({ type: actionTypes.PLAYLIST_ADD, playlistName: dest, addTracks });
    ws.sendBestEffortMessage(actionTypes.PLAYLIST_ADD, {
      playlistName: dest,
      trackIds: addTracks,
    });
  };
}

function playlistCreate(playlistName: string): Thunk<void> {
  return (dispatch, _getState, { ws }) => {
    const addTracks: string[] = [];
    dispatch({ type: actionTypes.PLAYLIST_ADD, playlistName, addTracks });
    ws.sendBestEffortMessage(actionTypes.PLAYLIST_ADD, {
      playlistName,
      trackIds: addTracks,
    });
  };
}

function playlistReorder(
  playlistName: string,
  insertAt: number,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { ws }) => {
    const state = getState();
    const filteredSelection = getFilteredSelection(state, playlistName);
    const playlist = state.tracks.playlists?.[playlistName];
    if (!playlist) {
      throw new Error(`Unknown playlist: ${playlistName}`);
    }
    const { reordered, newSelection, newIndex } = reorder(
      playlist,
      filteredSelection,
      insertAt,
    );
    dispatch({
      type: actionTypes.PLAYLIST_REORDER,
      playlistName,
      reordered,
      newSelection,
      newIndex,
    });
    await ws.sendAckedMessage(actionTypes.PLAYLIST_REORDER, {
      playlistName,
      selection: [...filteredSelection.entries()],
      insertAt,
    });
  };
}

/* Only supports waves library */
function playlistSort(sortKey: string, ascending: boolean): Thunk<void> {
  return (dispatch, getState) => {
    const state = getState();
    const search = getLibraryPlaylistSearch(state);
    const { getRouterQueryParams } = getOrCreatePlaylistSelectors(
      LIBRARY_NAME,
      URLSearchParams,
      LIBRARY_NAME,
    );
    const qp = new URLSearchParams(getRouterQueryParams(state, search));
    qp.set("sortKey", sortKey);
    qp.set("order", ascending ? "asc" : "desc");

    const { tracks } = state;
    const { libraries } = tracks;
    const lib = libraries[LIBRARY_NAME];

    dispatch({
      type: actionTypes.PLAYLIST_SEARCH_UPDATE,
      name: LIBRARY_NAME,
      search: qp.toString(),
    });
    dispatch({
      type: actionTypes.PLAYLIST_SORT,
      lib,
      name: LIBRARY_NAME,
      sortKey,
      ascending,
    });
  };
}

export * from "./selection";
export {
  playlistAdd,
  playlistCopy,
  playlistCreate,
  playlistDelete,
  playlistMove,
  playlistReorder,
  playlistSort,
  playlistsUpdate,
};
