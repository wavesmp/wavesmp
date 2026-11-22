import { LIBRARY_NAME } from "src/constants";

import { toastErr, toastSuccess } from "../toasts";

function download(id) {
  return async (dispatch, getState, { player }) => {
    const { tracks } = getState();
    const { libraries } = tracks;
    const lib = libraries[LIBRARY_NAME];
    const track = lib[id];

    try {
      await player.download(track);
      dispatch(toastSuccess("Download started"));
    } catch (err) {
      console.log("Download failed");
      console.log(err);
      dispatch(toastErr(`Download failed: ${err}`));
    }
  };
}

export { download };
