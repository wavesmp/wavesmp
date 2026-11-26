import type { PlaylistProps } from "src/selectors";
import { getPlaylistSelectors } from "src/selectors";
import type { Dispatch, Thunk } from "src/types/actionTypes";
import type { NormalizedTrack } from "src/types/trackTypes";
import { getPlaylistNameFromRoute } from "src/utils";

import { pause, play } from "./playing";
import { selectionClearAndAdd } from "./playlists";
import { trackToggle } from "./toggle";

/* The current location, and navigation (see RouterListener) */
interface KeyHistory {
  location: Pick<Location, "pathname" | "search">;
  push: (to: { pathname: string; search: string }) => void;
}

type LoadedPlaylistProps = Extract<PlaylistProps, { loaded: true }>;

const PLAYLIST_KEYS = new Set([" ", "Enter", "j", "k", "h", "l"]);

function tracksKeyDown(
  ev: KeyboardEvent,
  history: KeyHistory,
): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { key } = ev;
    /* Keys typed in inputs are not shortcuts */
    const target = ev.target as Partial<HTMLElement> | null;
    if (target?.tagName === "INPUT" || target?.contentEditable === "true") {
      return;
    }

    /* Space plays or pauses the playing track. Without a playing track,
     * it toggles the selected track, like Enter */
    if (key === " ") {
      const { track, isPlaying } = getState().tracks.playing;
      if (track) {
        ev.preventDefault();
        if (isPlaying) {
          dispatch(pause());
        } else {
          await dispatch(play());
        }
        return;
      }
    }

    if (!PLAYLIST_KEYS.has(key)) {
      return;
    }
    const { location } = history;
    const { search, pathname } = location;
    const playlistName = getPlaylistNameFromRoute(pathname);
    if (!playlistName) {
      return;
    }
    const playlistSelectors = getPlaylistSelectors(playlistName);
    if (!playlistSelectors) {
      return;
    }
    const props = playlistSelectors.getPlaylistProps(getState(), search);
    if (!props.loaded) {
      return;
    }
    playlistKeyDown(ev, history, dispatch, key, playlistName, props);
  };
}

/* Navigates to the given page, keeping the other query params */
function goToPage(history: KeyHistory, page: number): void {
  const { search, pathname } = history.location;
  const qp = new URLSearchParams(search);
  qp.set("page", page.toString());
  history.push({ pathname, search: qp.toString() });
}

function playlistKeyDown(
  ev: KeyboardEvent,
  history: KeyHistory,
  dispatch: Dispatch,
  key: string,
  playlistName: string,
  props: LoadedPlaylistProps,
): void {
  switch (key) {
    case "h": {
      const { currentPage } = props;
      if (currentPage < 1) {
        return;
      }
      goToPage(history, currentPage - 1);
      break;
    }
    case "l": {
      const { currentPage, lastPage } = props;
      if (currentPage >= lastPage) {
        return;
      }
      goToPage(history, currentPage + 1);
      break;
    }
    case "k":
    case "j": {
      const { displayItems, selection } = props;
      const n = displayItems.length;
      if (n === 0) {
        return;
      }
      const item = (i: number): NormalizedTrack => {
        const displayItem = displayItems[i];
        if (!displayItem) {
          throw new Error(`No display item at ${i.toString()}`);
        }
        return displayItem;
      };
      let i;
      if (key === "j") {
        i = n - 1;
        if (selection.has(item(i).index)) {
          return;
        }
        while (i > 0) {
          i -= 1;
          if (selection.has(item(i).index)) {
            i += 1;
            break;
          }
        }
      } else {
        i = 0;
        if (selection.has(item(i).index)) {
          return;
        }
        while (i < n - 1) {
          i += 1;
          if (selection.has(item(i).index)) {
            i -= 1;
            break;
          }
        }
      }
      const next = item(i);
      dispatch(
        selectionClearAndAdd(playlistName, next.index, next.id, displayItems),
      );
      break;
    }
    case " ":
    case "Enter": {
      const { displayItems, selection } = props;
      if (displayItems.length === 0 || selection.size === 0) {
        return;
      }
      for (const displayItem of displayItems) {
        if (selection.has(displayItem.index)) {
          if (key === " ") {
            ev.preventDefault();
          }
          dispatch(
            trackToggle(displayItem.id, playlistName, displayItem.index),
          );
        }
      }
      break;
    }
    // no default
  }
}

export { tracksKeyDown };
export type { KeyHistory };
