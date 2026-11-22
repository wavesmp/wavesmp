import { actionTypes } from "src/actionTypes";
import { LIBRARY_NAME } from "src/constants";
import {
  getFilteredSelection,
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors,
} from "src/selectors";

import { reorder } from "./reorder";

function playlistsUpdate(update) {
  return { type: actionTypes.PLAYLISTS_UPDATE, update };
}

function playlistCopy(src, dest) {
  return async (dispatch, getState, { ws }) => {
    await ws.sendAckedMessage(actionTypes.PLAYLIST_COPY, { src, dest });
    dispatch({ type: actionTypes.PLAYLIST_COPY, src, dest });
  };
}

function playlistDelete(playlistName) {
  return async (dispatch, getState, { ws }) => {
    await ws.sendAckedMessage(actionTypes.PLAYLIST_DELETE, { playlistName });
    dispatch({ type: actionTypes.PLAYLIST_DELETE, playlistName });
  };
}

function playlistMove(src, dest) {
  return async (dispatch, getState, { ws }) => {
    await ws.sendAckedMessage(actionTypes.PLAYLIST_MOVE, { src, dest });
    dispatch({ type: actionTypes.PLAYLIST_MOVE, src, dest });
  };
}

function playlistAdd(source, dest) {
  return (dispatch, getState, { ws }) => {
    console.log(`Adding from playlist ${source} to ${dest}`);

    const selection = getFilteredSelection(getState(), source);
    const addIndexes = Array.from(selection.keys());
    addIndexes.sort((a, b) => a - b);

    const addTracks = addIndexes.map((addIndex) => selection.get(addIndex));

    dispatch({ type: actionTypes.PLAYLIST_ADD, playlistName: dest, addTracks });
    ws.sendBestEffortMessage(actionTypes.PLAYLIST_ADD, {
      playlistName: dest,
      trackIds: addTracks,
    });
  };
}

function playlistCreate(playlistName) {
  return async (dispatch, getState, { ws }) => {
    const addTracks = [];
    dispatch({ type: actionTypes.PLAYLIST_ADD, playlistName, addTracks });
    ws.sendBestEffortMessage(actionTypes.PLAYLIST_ADD, {
      playlistName,
      trackIds: addTracks,
    });
  };
}

function playlistReorder(playlistName, insertAt) {
  return async (dispatch, getState, { ws }) => {
    const state = getState();
    const filteredSelection = getFilteredSelection(state, playlistName);
    const playlist = state.tracks.playlists[playlistName];
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
function playlistSort(sortKey, ascending) {
  return async (dispatch, getState) => {
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
