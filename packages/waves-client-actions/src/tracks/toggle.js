const types = require("waves-action-types");
const { NOW_PLAYING_NAME } = require("waves-client-constants");
const { shouldAddToDefaultPlaylist } = require("waves-client-util");

const { getLibNameForPlaylistName } = require("./util");

function trackToggle(id, playlistName, index) {
  return (dispatch, getState, { player, ws }) => {
    const { libraries, playing } = getState().tracks;
    const libName = getLibNameForPlaylistName(playlistName);
    const track = libraries[libName][id];
    const { playlist: oldPlaylistName } = playing;

    player.trackToggle(track);
    dispatch({
      type: types.TRACK_TOGGLE,
      playlistName,
      index,
      track,
      oldPlaylistName,
    });

    /* By default, playing a track adds it to the default playlist.
     * Unless, it it part of certain playlists */
    if (shouldAddToDefaultPlaylist(playlistName)) {
      ws.sendBestEffortMessage(types.PLAYLIST_ADD, {
        playlistName: NOW_PLAYING_NAME,
        trackIds: [id],
      });
    }
  };
}

module.exports.trackToggle = trackToggle;
