const types = require('waves-action-types')
const { removeSelection } = require('waves-client-selectors')

function tracksRemove(playlistName) {
  return async (dispatch, getState, { player, ws }) => {
    const state = getState()
    const { oldIndex, removedSelection, updatedSelection, index } =
      removeSelection(state, playlistName)

    /* Removed selection keys should be in order */
    const deleteIndexes = Array.from(removedSelection.keys())

    deleteIndexes.reverse()
    const { playing } = state.tracks

    const deletePlaying =
      playing.playlist === playlistName &&
      playing.track &&
      playing.track.id === removedSelection.get(oldIndex)

    if (deletePlaying) {
      player.pause()
    }

    dispatch({
      type: types.TRACKS_REMOVE,
      playlistName,
      deleteIndexes,
      selection: updatedSelection,
      index,
      deletePlaying,
    })
    await ws.sendAckedMessage(types.TRACKS_REMOVE, {
      playlistName,
      selection: [...removedSelection.entries()],
    })
  }
}

module.exports.tracksRemove = tracksRemove
