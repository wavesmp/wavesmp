import { actionTypes } from "src/actionTypes";
import { LIBRARY_NAME } from "src/constants";
import type { DeleteErr, DeleteResult } from "src/player/playerTypes";
import { getFilteredSelection } from "src/selectors";
import type { Dispatch, Thunk } from "src/types/actionTypes";
import type { Track } from "src/types/trackTypes";

import { toastErr, toastSuccess } from "../toasts";

interface TracksDeleteResult {
  deleted: Track[];
  deleteErrs: DeleteErr[];
  serverErrs: unknown[];
}

function tracksDelete(): Thunk<Promise<TracksDeleteResult>> {
  return async (dispatch, getState, { player, ws }) => {
    /* Update state of deleting tracks */
    const state = getState();
    const selection = getFilteredSelection(state, LIBRARY_NAME);
    const deleteIds = Array.from(selection.values());
    dispatch({
      type: actionTypes.TRACKS_INFO_UPDATE,
      ids: deleteIds,
      key: "state",
      value: "pending",
      libName: LIBRARY_NAME,
    });

    /* Delete tracks from cloud */
    const { tracks } = state;
    const { libraries, playing } = tracks;
    const library = libraries[LIBRARY_NAME] ?? {};
    const deleteTracks = deleteIds.flatMap((deleteId) => {
      const track = library[deleteId];
      return track ? [track] : [];
    });
    const deletePromises = await player.deleteTracks(deleteTracks);
    const result = await handleDeletePromises(deletePromises, dispatch);
    const { deleted } = result;
    const deletedIds = new Set(deleted.map((t) => t.id));

    /* Delete track metadata from server */
    try {
      await ws.sendAckedMessage(actionTypes.TRACKS_DELETE, {
        deleteIds: [...deletedIds],
      });
    } catch (err) {
      dispatch(toastErr(`Delete failure: ${String(err)}`));
      result.serverErrs.push(err);
      console.log("Failed to delete tracks from server");
      console.log(err);
      return result;
    }

    const { track } = playing;
    if (track && deletedIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause();
    }
    dispatch({
      type: actionTypes.TRACKS_DELETE,
      deleteIds: deletedIds,
      libName: LIBRARY_NAME,
    });
    return result;
  };
}

async function handleDeletePromises(
  promises: Promise<DeleteResult>[],
  dispatch: Dispatch,
): Promise<TracksDeleteResult> {
  const allDeleted: Track[] = [];
  const allDeleteErrs: DeleteErr[] = [];
  const serverErrs: unknown[] = [];
  await Promise.all(
    promises.map(async (promise) => {
      try {
        const { deleted, deleteErrs } = await promise;
        allDeleted.push(...deleted);
        allDeleteErrs.push(...deleteErrs);
        for (const err of deleteErrs) {
          handleDeleteErr(err, dispatch);
        }
        for (const track of deleted) {
          dispatch(toastSuccess(`Deleted ${getTrackName(track)}`));
        }
      } catch (err) {
        serverErrs.push(err);
        dispatch(toastErr(`Delete failure: ${String(err)}`));
        console.log("Error deleting from server:");
        console.log(err);
      }
    }),
  );
  return {
    deleted: allDeleted,
    deleteErrs: allDeleteErrs,
    serverErrs,
  };
}

/* The first tag that is set, to describe the track */
function getTrackName(track: Track): string {
  return (
    [track.title, track.artist, track.album, track.genre].find((tag) => tag) ??
    ""
  );
}

function handleDeleteErr(err: DeleteErr, dispatch: Dispatch): void {
  const { track, code, message } = err;
  const name = getTrackName(track);
  dispatch(toastErr(`${name}: ${message}`));
  console.log(`Failed to delete track ${name}: ${code} - ${message}`);
}

export { tracksDelete };
export type { TracksDeleteResult };
