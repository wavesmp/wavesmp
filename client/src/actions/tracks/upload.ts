import { actionTypes } from "src/actionTypes";
import { LIBRARY_NAME, UPLOADS_NAME } from "src/constants";
import { UploadError } from "src/errors";
import type { Dispatch, Thunk } from "src/types/actionTypes";
import type { Track, TrackSource } from "src/types/trackTypes";

import { toastErr, toastSuccess } from "../toasts";
import { tracksAdd } from "./add";

interface TracksUploadResult {
  uploaded: Track[];
  uploadErrs: unknown[];
  serverErr?: unknown;
}

function tracksUpload(
  trackSource?: TrackSource,
): Thunk<Promise<TracksUploadResult>> {
  return async (dispatch, getState, { player, ws }) => {
    /* Transition tracks to uploading state */
    const { tracks } = getState();
    const { playing, libraries } = tracks;
    const { track } = playing;
    const uploads = libraries[UPLOADS_NAME] ?? {};
    const uploadIds = Object.keys(uploads);
    dispatch({
      type: actionTypes.TRACKS_INFO_UPDATE,
      ids: uploadIds,
      key: "state",
      value: "uploading",
      libName: UPLOADS_NAME,
    });
    dispatch({
      type: actionTypes.TRACKS_INFO_UPDATE,
      ids: uploadIds,
      key: "uploadProgress",
      value: 0,
      libName: UPLOADS_NAME,
    });

    /* Upload tracks to cloud */
    const uploadValues = Object.values(uploads);
    const uploadPromises = player.upload(trackSource, uploadValues);
    const result = await handleUploadPromises(uploadPromises, dispatch);
    const { uploaded } = result;

    /* Upload metadata to server */
    try {
      await ws.sendAckedMessage(actionTypes.TRACKS_ADD, { tracks: uploaded });
    } catch (serverErr) {
      console.log("Failed to upload tracks to server");
      console.log(serverErr);
      dispatch(toastErr(`Upload failure: ${String(serverErr)}`));
      result.serverErr = serverErr;
      return result;
    }

    const uploadedIds = new Set(uploaded.map((t) => t.id));
    if (track && uploadedIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause();
    }

    /* Delete tracks from uploads. Add to library */
    dispatch({
      type: actionTypes.TRACKS_DELETE,
      deleteIds: uploadedIds,
      libName: UPLOADS_NAME,
    });
    dispatch(tracksAdd(uploaded, LIBRARY_NAME));
    return result;
  };
}

async function handleUploadPromises(
  promises: Promise<Track>[],
  dispatch: Dispatch,
): Promise<TracksUploadResult> {
  const uploaded: Track[] = [];
  const uploadErrs: unknown[] = [];
  await Promise.all(
    promises.map(async (promise) => {
      try {
        const { file, ...track } = await promise;
        dispatch(toastSuccess(`Uploaded ${file?.name ?? track.id}`));
        uploaded.push(unprocessTrack(track));
      } catch (err) {
        if (err instanceof UploadError) {
          const name = err.track.file?.name ?? err.track.id;
          dispatch(toastErr(`${name}: ${String(err.cause)}`));
          console.log("Track upload failure");
          console.log(err);
          console.log(err.cause);
        } else {
          // Should not be reached
          dispatch(toastErr(String(err)));
          console.log("Expected upload error but got:");
          console.log(err);
        }
        uploadErrs.push(err);
      }
    }),
  );
  return { uploaded, uploadErrs };
}

/* The track info sent to the server, without client-only fields */
function unprocessTrack(track: Track): Track {
  const unprocessed = { ...track };
  delete unprocessed.createdAt;
  delete unprocessed.createdAtPretty;
  return unprocessed;
}

export { tracksUpload };
export type { TracksUploadResult };
