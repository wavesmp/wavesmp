const types = require("waves-action-types");
const { LIBRARY_NAME } = require("waves-client-constants");
const { getFilteredSelection } = require("waves-client-selectors");

const { toastErr, toastSuccess } = require("../toasts");

function tracksDelete() {
  return async (dispatch, getState, { player, ws }) => {
    /* Update state of deleting tracks */
    const state = getState();
    const selection = getFilteredSelection(state, LIBRARY_NAME);
    const deleteIds = Array.from(selection.values());
    dispatch({
      type: types.TRACKS_INFO_UPDATE,
      ids: deleteIds,
      key: "state",
      value: "pending",
      libName: LIBRARY_NAME,
    });

    /* Delete tracks from cloud */
    const { tracks } = state;
    const { libraries, playing } = tracks;
    const library = libraries[LIBRARY_NAME];

    const deleteTracks = deleteIds.map((deleteId) => library[deleteId]);
    const deletePromises = await player.deleteTracks(deleteTracks);
    const result = await handleDeletePromises(deletePromises, dispatch);
    const { deleted } = result;
    const deletedIds = new Set(deleted.map((t) => t.id));

    /* Delete track metadata from server */
    try {
      await ws.sendAckedMessage(types.TRACKS_DELETE, {
        deleteIds: [...deletedIds],
      });
    } catch (err) {
      dispatch(toastErr(`Delete failure: ${err}`));
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
      type: types.TRACKS_DELETE,
      deleteIds: deletedIds,
      libName: LIBRARY_NAME,
    });
    return result;
  };
}

async function handleDeletePromises(promises, dispatch) {
  const allDeleted = [];
  const allDeleteErrs = [];
  const serverErrs = [];
  await Promise.all(
    promises.map(async (promise) => {
      try {
        const { deleted, deleteErrs } = await promise;
        Array.prototype.push.apply(allDeleted, deleted);
        Array.prototype.push.apply(allDeleteErrs, deleteErrs);

        for (const err of deleteErrs) {
          handleDeleteErr(err, dispatch);
        }
        for (const track of deleted) {
          const name =
            track.title || track.artist || track.album || track.genre;
          dispatch(toastSuccess(`Deleted ${name}`));
        }
      } catch (err) {
        serverErrs.push(err);
        dispatch(toastErr(`Delete failure: ${err}`));
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

function handleDeleteErr(err, dispatch) {
  const { track, code, message } = err;
  const name = track.title || track.artist || track.album || track.genre;
  dispatch(toastErr(`${name}: ${message}`));
  console.log(`Failed to delete track ${name}: ${code} - ${message}`);
}

module.exports.tracksDelete = tracksDelete;
