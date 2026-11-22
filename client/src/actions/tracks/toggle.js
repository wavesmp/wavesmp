import { actionTypes } from "src/actionTypes";
import { NOW_PLAYING_NAME } from "src/constants";
import { shouldAddToDefaultPlaylist } from "src/utils";

import { getLibNameForPlaylistName } from "./util";

function trackToggle(id, playlistName, index) {
  return (dispatch, getState, { player, ws }) => {
    const { libraries, playing } = getState().tracks;
    const libName = getLibNameForPlaylistName(playlistName);
    const track = libraries[libName][id];
    const { playlist: oldPlaylistName } = playing;

    player.trackToggle(track);
    dispatch({
      type: actionTypes.TRACK_TOGGLE,
      playlistName,
      index,
      track,
      oldPlaylistName,
    });

    /* By default, playing a track adds it to the default playlist.
     * Unless, it it part of certain playlists */
    if (shouldAddToDefaultPlaylist(playlistName)) {
      ws.sendBestEffortMessage(actionTypes.PLAYLIST_ADD, {
        playlistName: NOW_PLAYING_NAME,
        trackIds: [id],
      });
    }
  };
}

export { trackToggle };
