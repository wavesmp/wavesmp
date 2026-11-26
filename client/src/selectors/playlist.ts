import Fuse from "fuse.js";
import { createSelector } from "reselect";

import type { Playlist, Selection } from "src/types/playlistTypes";
import type { SelectorState } from "src/types/stateTypes";
import type { Library, NormalizedTrack } from "src/types/trackTypes";
import { normalizeTrack } from "src/utils";

import { _getPlaylist, getRowsPerPage } from "./base";

const FUSE_OPTS = {
  keys: ["title", "artist", "album", "genre"],
  shouldSort: false,
  threshold: 0.2,
};
const ORDER_QUERY_KEY = "order";
const PAGE_QUERY_KEY = "page";
const SEARCH_QUERY_KEY = "search";
const SORT_KEY_QUERY_KEY = "sortKey";

const DEFAULT_ASCENDING = true;
const DEFAULT_PAGE = 0;
const DEFAULT_SORT_KEY = "title";
const DEFAULT_SEARCH_STRING = "";

/* The props of a playlist page. Not loaded until the playlist and its
 * library are */
type PlaylistProps =
  | { loaded: false }
  | {
      loaded: true;
      index: number | null;
      selection: Selection;
      sortKey: string | undefined;
      ascending: boolean | undefined;
      numItems: number;
      currentPage: number;
      lastPage: number;
      displayItems: NormalizedTrack[];
    };

type PlaylistSelectors = ReturnType<typeof createPlaylistSelectors>;

const playlistSelectors = new Map<string, PlaylistSelectors>();

function getOrCreatePlaylistSelectors(
  playlistName: string,
  URLSearchParams: typeof globalThis.URLSearchParams,
  libName: string,
): PlaylistSelectors {
  let playlistSelector = playlistSelectors.get(playlistName);
  if (!playlistSelector) {
    playlistSelector = createPlaylistSelectors(
      playlistName,
      URLSearchParams,
      libName,
    );
    playlistSelectors.set(playlistName, playlistSelector);
  }
  return playlistSelector;
}

function getPlaylistSelectors(
  playlistName: string,
): PlaylistSelectors | undefined {
  return playlistSelectors.get(playlistName);
}

function normalizePage(currentPage: number, lastPage: number): number {
  if (currentPage < 0) {
    return 0;
  }
  if (currentPage > lastPage) {
    return lastPage;
  }
  return currentPage;
}

/* A query param, or the default if it is missing or empty */
function getParam(
  qp: URLSearchParams,
  key: string,
  defaultValue: string,
): string {
  const value = qp.get(key);
  if (!value) {
    return defaultValue;
  }
  return value;
}

/* A playlist's track may be missing from its library (e.g. a deleted
 * track). Display it as a blank row, so playlist indexes still line up */
function normalizeLibTrack(
  lib: Library,
  trackId: string,
  index: number,
): NormalizedTrack {
  const track = lib[trackId] ?? {
    id: trackId,
    source: "s3",
    title: "",
    artist: "",
    genre: "",
    duration: NaN,
  };
  return normalizeTrack(track, index);
}

/* The selectors of a playlist. They are memoized, so are created once per
 * playlist (see getOrCreatePlaylistSelectors). Their types are inferred */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createPlaylistSelectors(
  playlistName: string,
  URLSearchParams: typeof globalThis.URLSearchParams,
  libName: string,
) {
  function getLib(state: SelectorState): Library | null | undefined {
    return state.tracks.libraries[libName];
  }

  /* router query params */
  function _getRouterQueryParams(search: string): URLSearchParams {
    return new URLSearchParams(search);
  }

  /* Use direct search value since query params may need to be
   * accessed e.g. when sorting, track next, etc */
  const getRouterQueryParams = createSelector(
    [(_state: unknown, search: string): string => search],
    _getRouterQueryParams,
  );

  /* router search string
   *
   * Router search string is directly used in the view, but router
   * ascending and sort key values are dispatched in an action
   * because, when a track list is sorted, the play id may change,
   * which needs an update to the store.
   *
   * Ensure empty string is returned. Otherwise, input component
   * may think it's uncontrolled */
  function _getRouterSearchString(qp: URLSearchParams): string {
    return getParam(qp, SEARCH_QUERY_KEY, DEFAULT_SEARCH_STRING);
  }

  const getRouterSearchString = createSelector(
    [getRouterQueryParams],
    _getRouterSearchString,
  );

  /* router ascending  */
  function _getRouterAscending(qp: URLSearchParams): boolean {
    const order = qp.get(ORDER_QUERY_KEY);
    if (order) {
      return order === "asc";
    }
    return DEFAULT_ASCENDING;
  }

  const getRouterAscending = createSelector(
    [getRouterQueryParams],
    _getRouterAscending,
  );

  /* router sort key  */
  function _getRouterSortKey(qp: URLSearchParams): string {
    return getParam(qp, SORT_KEY_QUERY_KEY, DEFAULT_SORT_KEY);
  }

  const getRouterSortKey = createSelector(
    [getRouterQueryParams],
    _getRouterSortKey,
  );

  /* router page  */
  function _getRouterPage(qp: URLSearchParams): number {
    return parseInt(qp.get(PAGE_QUERY_KEY) ?? "", 10) || DEFAULT_PAGE;
  }

  const getRouterPage = createSelector([getRouterQueryParams], _getRouterPage);

  function getPlaylist(state: SelectorState): Playlist | null | undefined {
    return _getPlaylist(state, playlistName);
  }

  /* playlist display items */
  function _getFuse(
    playlist: Playlist | null | undefined,
    lib: Library | null | undefined,
    searchString: string,
  ): Fuse<NormalizedTrack> | null {
    if (!playlist || !lib || !searchString) {
      return null;
    }
    const { tracks } = playlist;
    const items = tracks.map((track, i) => normalizeLibTrack(lib, track, i));
    return new Fuse(items, FUSE_OPTS);
  }

  const getFuse = createSelector(
    [getPlaylist, getLib, getRouterSearchString],
    _getFuse,
  );

  function _getSearchItems(
    fuse: Fuse<NormalizedTrack> | null,
    searchString: string,
  ): NormalizedTrack[] | null {
    if (!fuse) {
      return null;
    }
    return fuse.search(searchString).map(({ item }) => item);
  }

  const getSearchItems = createSelector(
    [getFuse, getRouterSearchString],
    _getSearchItems,
  );

  function getPageItems(
    searchItems: NormalizedTrack[] | null,
    tracks: string[],
    lib: Library,
    startIndex: number,
    stopIndex: number,
  ): NormalizedTrack[] {
    if (searchItems) {
      return searchItems.slice(startIndex, stopIndex);
    }
    return tracks
      .slice(startIndex, stopIndex)
      .map((trackId, i) => normalizeLibTrack(lib, trackId, startIndex + i));
  }

  function _getPlaylistProps(
    routerPage: number,
    rowsPerPageSetting: number | null,
    searchItems: NormalizedTrack[] | null,
    playlist: Playlist | null | undefined,
    lib: Library | null | undefined,
  ): PlaylistProps {
    if (!playlist || !lib) {
      return { loaded: false };
    }
    /* Until settings load, there are no rows per page */
    const rowsPerPage = rowsPerPageSetting ?? 0;
    const { tracks, index, selection, sortKey, ascending } = playlist;
    const numItems = searchItems ? searchItems.length : tracks.length;
    const lastPage =
      numItems === 0 ? 0 : Math.floor((numItems - 1) / rowsPerPage);
    const currentPage = normalizePage(routerPage, lastPage);
    const startIndex = currentPage * rowsPerPage;
    const stopIndex = (currentPage + 1) * rowsPerPage;
    const displayItems = getPageItems(
      searchItems,
      tracks,
      lib,
      startIndex,
      stopIndex,
    );
    return {
      loaded: true,
      index,
      selection,
      sortKey,
      ascending,
      numItems,
      currentPage,
      lastPage,
      displayItems,
    };
  }

  const getPlaylistProps = createSelector(
    [getRouterPage, getRowsPerPage, getSearchItems, getPlaylist, getLib],
    _getPlaylistProps,
  );

  return {
    getRouterQueryParams,
    getRouterAscending,
    getRouterSearchString,
    getRouterSortKey,
    getSearchItems,
    getPlaylistProps,
  };
}

export { getOrCreatePlaylistSelectors, getPlaylistSelectors };
export type { PlaylistProps, PlaylistSelectors };
