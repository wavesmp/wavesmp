const types = require("waves-action-types");

const TAGS_OF_INTEREST = ["title", "artist", "genre"];

function tracksAdd(update, libName) {
  return (dispatch, getState) => {
    /* Extract existing library */
    const { tracks } = getState();
    const { libraries } = tracks;
    const libraryById = { ...libraries[libName] };

    /* Apply and dispatch update */
    updateLibraryById(libraryById, update);
    dispatch({ type: types.TRACKS_ADD, lib: libraryById, libName });
  };
}

function updateLibraryById(libraryById, update) {
  for (const item of update) {
    addMissingTags(item);
    processTrack(item);
    libraryById[item.id] = item;
  }
  return libraryById;
}

function addMissingTags(item) {
  for (const tag of TAGS_OF_INTEREST) {
    item[tag] = item[tag] || `Unknown ${tag}`;
  }
}

function processTrack(track) {
  const epoch = parseInt(track.id.substring(0, 8), 16);
  track.createdAt = epoch;
  track.createdAtPretty = new Date(epoch * 1000).toLocaleString();
}

module.exports.tracksAdd = tracksAdd;
