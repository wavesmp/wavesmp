import { actionTypes } from "src/actionTypes";
import { UPLOADS_NAME } from "src/constants";

import { toastErr } from "../toasts";

function trackUploadsDelete() {
  return (dispatch, getState, { player }) => {
    const { playing, playlists } = getState().tracks;
    const { track } = playing;
    const playlist = playlists[UPLOADS_NAME];
    const { selection } = playlist;
    const deleteIds = new Set(selection.values());
    if (track && deleteIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause();
    }
    dispatch({
      type: actionTypes.TRACKS_DELETE,
      deleteIds,
      libName: UPLOADS_NAME,
    });
  };
}

function tracksLocalInfoUpdate(id, key, value, libName) {
  return {
    type: actionTypes.TRACKS_INFO_UPDATE,
    ids: [id],
    key,
    value,
    libName,
  };
}

function tracksInfoUpdate(id, key, value, libName) {
  return async (dispatch, getState, { ws }) => {
    dispatch({
      type: actionTypes.TRACKS_INFO_UPDATE,
      ids: [id],
      key,
      value,
      libName,
    });
    try {
      await ws.sendAckedMessage(actionTypes.TRACKS_INFO_UPDATE, {
        id,
        key,
        value,
      });
    } catch (err) {
      dispatch(toastErr(`${err}`));
    }
  };
}

export * from "./add";
export * from "./delete";
export * from "./keybindings";
export * from "./playing";
export * from "./playlists";
export * from "./remove";
export * from "./sideEffects";
export * from "./toggle";
export * from "./tracknext";
export * from "./upload";
export { tracksInfoUpdate, tracksLocalInfoUpdate, trackUploadsDelete };
