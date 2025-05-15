const { LIBRARY_NAME, UPLOADS_NAME } = require("waves-client-constants");

function getLibNameForPlaylistName(playlistName) {
  if (playlistName === UPLOADS_NAME) {
    return UPLOADS_NAME;
  }
  return LIBRARY_NAME;
}

module.exports.getLibNameForPlaylistName = getLibNameForPlaylistName;
