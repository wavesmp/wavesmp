import { actionTypes } from "src/actionTypes";
import { NOW_PLAYING_NAME } from "src/constants";
import { getOrCreatePlaylistSelectors } from "src/selectors";
import type { Dispatch, GetState, Thunk } from "src/types/actionTypes";
import type { Playlist } from "src/types/playlistTypes";
import type { Library, NormalizedTrack } from "src/types/trackTypes";
import { normalizeTrack, shouldAddToDefaultPlaylist } from "src/utils";

import type { Player } from "src/player";
import type { WavesSocket } from "src/socket";

import { toastErr } from "../toasts";
import { getLibNameForPlaylistName } from "./util";

function trackNext(
  URLSearchParams: typeof globalThis.URLSearchParams,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { player, ws }) => {
    await _trackNext(dispatch, getState, URLSearchParams, player, ws, false);
  };
}

function trackPrevious(
  URLSearchParams: typeof globalThis.URLSearchParams,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { player, ws }) => {
    await _trackNext(dispatch, getState, URLSearchParams, player, ws, true);
  };
}

function trackEnded(
  URLSearchParams: typeof globalThis.URLSearchParams,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { player, ws }) => {
    if (getState().tracks.playing.repeat) {
      await player.repeat();
    } else {
      await _trackNext(dispatch, getState, URLSearchParams, player, ws, false);
    }
  };
}

async function _trackNext(
  dispatch: Dispatch,
  getState: GetState,
  URLSearchParams: typeof globalThis.URLSearchParams,
  player: Player,
  ws: WavesSocket,
  prev: boolean,
): Promise<void> {
  const state = getState();
  const { tracks } = state;
  const { libraries, playing, playlists } = tracks;
  const { playlist: playlistName, isPlaying, shuffle } = playing;
  if (playlistName === null) {
    throw new Error("No playlist is playing");
  }
  const playlist = playlists?.[playlistName];
  if (!playlist) {
    throw new Error(`Unknown playlist: ${playlistName}`);
  }
  const libName = getLibNameForPlaylistName(playlistName);
  const lib = libraries[libName] ?? {};
  const { getSearchItems } = getOrCreatePlaylistSelectors(
    playlistName,
    URLSearchParams,
    libName,
  );
  const searchItems = getSearchItems(state, playlist.search);
  const nextTrack = getNextTrack(searchItems, playlist, shuffle, prev, lib);
  dispatch({
    type: actionTypes.TRACK_NEXT,
    nextTrack,
    playlistName,
  });
  if (nextTrack) {
    if (shouldAddToDefaultPlaylist(playlistName)) {
      ws.sendBestEffortMessage(actionTypes.PLAYLIST_ADD, {
        playlistName: NOW_PLAYING_NAME,
        trackIds: [nextTrack.id],
      });
    }
    try {
      await player.trackNext(nextTrack, isPlaying);
    } catch (err) {
      dispatch(toastErr(String(err)));
    }
  } else {
    player.pause();
    void player.seek(0);
  }
}

/* The track at the index, if it is in the library */
function getLibTrack(
  lib: Library,
  trackId: string | undefined,
  index: number,
): NormalizedTrack | null {
  const track = trackId === undefined ? undefined : lib[trackId];
  return track ? normalizeTrack(track, index) : null;
}

function getNextTrack(
  searchItems: NormalizedTrack[] | null,
  playlist: Playlist,
  shuffle: boolean,
  prev: boolean,
  lib: Library,
): NormalizedTrack | null {
  const { tracks, index } = playlist;
  const items = searchItems ?? tracks;
  const { length } = items;
  if (length === 0) {
    return null;
  }
  if (shuffle) {
    const i = Math.floor(Math.random() * length);
    if (searchItems) {
      return searchItems[i] ?? null;
    }
    return getLibTrack(lib, tracks[i], i);
  }
  if (searchItems) {
    /* Find the track after the current one.
     * If prev, find the track before the current one. */
    let start;
    let end;
    if (prev) {
      start = 1;
      end = length;
    } else {
      start = 0;
      end = length - 1;
    }
    for (let i = start; i < end; i += 1) {
      const item = searchItems[i];
      if (item?.index === index) {
        if (prev) {
          return searchItems[i - 1] ?? null;
        }
        return searchItems[i + 1] ?? null;
      }
    }
    return null;
  }
  /* If the playing track is not in this playlist, start from the top */
  const current = index ?? 0;
  if (prev && current > 0) {
    const nextIndex = current - 1;
    return getLibTrack(lib, tracks[nextIndex], nextIndex);
  }
  if (!prev && current < length - 1) {
    const nextIndex = current + 1;
    return getLibTrack(lib, tracks[nextIndex], nextIndex);
  }
  return null;
}

export { trackEnded, trackNext, trackPrevious };
