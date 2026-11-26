import { LIBRARY_NAME } from "src/constants";
import type { Thunk } from "src/types/actionTypes";

import { toastErr, toastSuccess } from "../toasts";

function download(id: string): Thunk<Promise<void>> {
  return async (dispatch, getState, { player }) => {
    const { libraries } = getState().tracks;
    const track = libraries[LIBRARY_NAME]?.[id];
    try {
      if (!track) {
        throw new Error(`Unknown track: ${id}`);
      }
      await player.download(track);
      dispatch(toastSuccess("Download started"));
    } catch (err) {
      console.log("Download failed");
      console.log(err);
      dispatch(toastErr(`Download failed: ${String(err)}`));
    }
  };
}

export { download };
