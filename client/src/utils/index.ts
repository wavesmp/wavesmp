import formatTime from "format-duration";

import {
  LIBRARY_NAME,
  NOW_PLAYING_NAME,
  UPLOADS_NAME,
  routes,
} from "src/constants";
import type { Selection } from "src/types/playlistTypes";
import type { NormalizedTrack, Track } from "src/types/trackTypes";

function shouldAddToDefaultPlaylist(playlistName: string): boolean {
  return playlistName !== NOW_PLAYING_NAME && playlistName !== UPLOADS_NAME;
}

function normalizeTrack(track: Track, index: number): NormalizedTrack {
  return {
    ...track,
    time: formatTime(1000 * track.duration),
    index,
  };
}

/* The selected items that are displayed */
function filterSelection(
  displayItems: readonly { index: number }[],
  selection: Selection,
): Selection {
  const filtered: Selection = new Map();
  for (const { index } of displayItems) {
    const trackId = selection.get(index);
    if (trackId !== undefined) {
      filtered.set(index, trackId);
    }
  }
  return filtered;
}

function getPlaylistNameFromRoute(pathname: string): string | null {
  if (pathname === routes.nowplaying) {
    return NOW_PLAYING_NAME;
  }
  if (pathname === routes.library) {
    return LIBRARY_NAME;
  }
  if (pathname === routes.upload) {
    return UPLOADS_NAME;
  }
  if (pathname.startsWith(routes.playlistBase)) {
    return pathname.slice(routes.playlistBase.length);
  }
  return null;
}

export {
  filterSelection,
  getPlaylistNameFromRoute,
  normalizeTrack,
  shouldAddToDefaultPlaylist,
};
