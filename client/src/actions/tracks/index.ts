import { actionTypes } from "src/actionTypes";
import { UPLOADS_NAME } from "src/constants";
import type {
  Thunk,
  TrackInfo,
  TrackInfoUpdate,
  WavesAction,
} from "src/types/actionTypes";

import { toastErr } from "../toasts";

type TracksInfoUpdateAction = Extract<
  WavesAction,
  { type: typeof actionTypes.TRACKS_INFO_UPDATE }
>;

function trackUploadsDelete(): Thunk<void> {
  return (dispatch, getState, { player }) => {
    const { playing, playlists } = getState().tracks;
    const { track } = playing;
    const playlist = playlists?.[UPLOADS_NAME];
    if (!playlist) {
      throw new Error("Uploads are not loaded");
    }
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

function infoUpdateAction<K extends keyof TrackInfo>(
  ids: string[],
  key: K,
  value: TrackInfo[K],
  libName: string,
): TracksInfoUpdateAction {
  /* The value matches the key, which is what TrackInfoUpdate describes */
  const update = { key, value } as TrackInfoUpdate;
  return { type: actionTypes.TRACKS_INFO_UPDATE, ids, libName, ...update };
}

/* Update track info locally only, e.g. for uploads that are not on the
 * server yet */
function tracksLocalInfoUpdate<K extends keyof TrackInfo>(
  id: string,
  key: K,
  value: TrackInfo[K],
  libName: string,
): TracksInfoUpdateAction {
  return infoUpdateAction([id], key, value, libName);
}

function tracksInfoUpdate<K extends keyof TrackInfo>(
  id: string,
  key: K,
  value: TrackInfo[K],
  libName: string,
): Thunk<Promise<void>> {
  return async (dispatch, _getState, { ws }) => {
    dispatch(infoUpdateAction([id], key, value, libName));
    try {
      await ws.sendAckedMessage(actionTypes.TRACKS_INFO_UPDATE, {
        id,
        key,
        value,
      });
    } catch (err) {
      dispatch(toastErr(String(err)));
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
export {
  infoUpdateAction,
  tracksInfoUpdate,
  tracksLocalInfoUpdate,
  trackUploadsDelete,
};
