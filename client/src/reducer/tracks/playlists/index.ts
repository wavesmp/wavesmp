import { actionTypes } from "src/actionTypes";
import { NOW_PLAYING_NAME } from "src/constants";
import type { ReducerAction } from "src/types/actionTypes";
import type {
  Playlist,
  Playlists,
  Selection,
  ServerPlaylist,
} from "src/types/playlistTypes";
import type { Library } from "src/types/trackTypes";
import { shouldAddToDefaultPlaylist } from "src/utils";

import { reducerSelection } from "./selection";

/* Maps playlist names to playlists. Playlists contain:
 * - name
 * - tracks
 * - selection (initialized to empty object)
 * - search - undefined by default. React router url query params
 * - index - undefined by default
 * - ascending - (optional) undefined by default
 * - sortKey - (optional) undefined by default
 */
const initialPlaylists: Playlists = null;

/* Search/sort may have been specified before playlist
 * has even loaded. Cache values until load time */
const initialPlaylistsSearch = new Map<string, string>();
const initialPlaylistsSortKey = new Map<string, string>();
const initialPlaylistsAscending = new Map<string, boolean>();

/* Loaded playlists, keyed by name */
type LoadedPlaylists = Record<string, Playlist | undefined>;

function getPlaylist(playlists: Playlists, name: string): Playlist {
  const playlist = playlists?.[name];
  if (!playlist) {
    throw new Error(`Unknown playlist: ${name}`);
  }
  return playlist;
}

function reducerPlaylists(
  playlists: Playlists = initialPlaylists,
  action: ReducerAction,
): Playlists {
  switch (action.type) {
    case actionTypes.SELECTION_ADD:
    case actionTypes.SELECTION_RANGE:
    case actionTypes.SELECTION_REMOVE:
    case actionTypes.SELECTION_CLEAR_AND_ADD: {
      const { name } = action;
      const playlist = getPlaylist(playlists, name);
      return {
        ...playlists,
        [name]: reducerSelection(playlist, action),
      };
    }
    case actionTypes.TRACKS_ADD: {
      const { lib, libName } = action;
      const libPlaylistTracks = Object.keys(lib);
      const existing = playlists?.[libName];
      const libPlaylist = existing
        ? { ...existing }
        : getDefaultLibraryPlaylist(libName);
      const { sortKey, ascending, index, selection } = libPlaylist;
      const { newIndex, newSelection } = sortPlaylist(
        libPlaylistTracks,
        lib,
        sortKey,
        ascending,
        index,
        selection,
      );
      libPlaylist.tracks = libPlaylistTracks;
      libPlaylist.index = newIndex;
      libPlaylist.selection = newSelection;
      return { ...playlists, [libName]: libPlaylist };
    }
    case actionTypes.PLAYLISTS_UPDATE: {
      const { update } = action;
      const newPlaylists: LoadedPlaylists = { ...playlists };
      for (const newPlaylist of update) {
        const { name } = newPlaylist;
        const playlist = newPlaylists[name];
        if (playlist) {
          newPlaylists[name] = mergePlaylists(playlist, newPlaylist);
        } else {
          newPlaylists[name] = withPlaylistDefaults(newPlaylist);
        }
      }
      newPlaylists[NOW_PLAYING_NAME] ??= getDefaultPlaylist();
      return newPlaylists;
    }
    case actionTypes.TRACK_TOGGLE: {
      const { oldPlaylistName, playlistName, index, track } = action;
      const { id } = track;
      const newPlaylists: LoadedPlaylists = { ...playlists };

      /* Remove play id from old playlist, if it exists */
      const oldPlaylist =
        oldPlaylistName === null ? undefined : newPlaylists[oldPlaylistName];
      if (oldPlaylist && oldPlaylistName !== null) {
        newPlaylists[oldPlaylistName] = { ...oldPlaylist, index: null };
      }

      return trackNext(newPlaylists, playlistName, id, index);
    }
    case actionTypes.TRACK_NEXT: {
      const { nextTrack, playlistName } = action;
      if (!nextTrack) {
        return playlists;
      }
      const { index, id } = nextTrack;
      return trackNext({ ...playlists }, playlistName, id, index);
    }
    case actionTypes.PLAYLIST_SEARCH_UPDATE: {
      const { name, search } = action;
      const playlist = playlists?.[name];
      if (!playlists || !playlist) {
        initialPlaylistsSearch.set(name, search);
        return playlists;
      }
      if (search === playlist.search) {
        return playlists;
      }
      return { ...playlists, [name]: { ...playlist, search } };
    }
    case actionTypes.PLAYLIST_SORT: {
      const { lib, name, sortKey, ascending } = action;
      const playlist = playlists?.[name];
      if (!lib || !playlists || !playlist) {
        initialPlaylistsAscending.set(name, ascending);
        initialPlaylistsSortKey.set(name, sortKey);
        return playlists;
      }
      const { index, selection } = playlist;
      const tracks = [...playlist.tracks];
      const { newIndex, newSelection } = sortPlaylist(
        tracks,
        lib,
        sortKey,
        ascending,
        index,
        selection,
      );
      return {
        ...playlists,
        [name]: {
          ...playlist,
          sortKey,
          ascending,
          tracks,
          index: newIndex,
          selection: newSelection,
        },
      };
    }
    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action;
      const newPlaylists: LoadedPlaylists = {};
      for (const [playlistName, playlist] of Object.entries(playlists ?? {})) {
        if (playlist) {
          newPlaylists[playlistName] = tracksDeleteFromPlaylist(
            playlist,
            deleteIds,
          );
        }
      }
      return newPlaylists;
    }
    case actionTypes.PLAYLIST_ADD: {
      const { addTracks, playlistName } = action;
      return {
        ...playlists,
        [playlistName]: playlistAdd(addTracks, playlistName, playlists),
      };
    }
    case actionTypes.PLAYLIST_REORDER: {
      const { reordered, playlistName, newSelection, newIndex } = action;
      return {
        ...playlists,
        [playlistName]: {
          ...getPlaylist(playlists, playlistName),
          tracks: reordered,
          selection: newSelection,
          index: newIndex,
        },
      };
    }
    case actionTypes.PLAYLIST_MOVE: {
      const { src, dest } = action;
      const newPlaylists: LoadedPlaylists = { ...playlists };
      newPlaylists[dest] = {
        ...getPlaylist(playlists, src),
        name: dest,
      };
      newPlaylists[src] = undefined;
      return withoutUndefined(newPlaylists);
    }
    case actionTypes.TRACKS_REMOVE: {
      const { deleteIndexes, playlistName, selection, index } = action;
      const playlist = getPlaylist(playlists, playlistName);
      const tracks = [...playlist.tracks];
      for (const deleteIndex of deleteIndexes) {
        tracks.splice(deleteIndex, 1);
      }
      return {
        ...playlists,
        [playlistName]: {
          ...playlist,
          tracks,
          selection,
          index,
        },
      };
    }
    case actionTypes.PLAYLIST_COPY: {
      const { src, dest } = action;
      const copyPlaylist = withPlaylistDefaults({
        name: dest,
        tracks: [...getPlaylist(playlists, src).tracks],
      });
      return { ...playlists, [dest]: copyPlaylist };
    }
    case actionTypes.PLAYLIST_DELETE: {
      const { playlistName } = action;
      const newPlaylists: LoadedPlaylists = { ...playlists };
      newPlaylists[playlistName] = undefined;
      newPlaylists[NOW_PLAYING_NAME] ??= getDefaultPlaylist();
      return withoutUndefined(newPlaylists);
    }
    default:
      return playlists;
  }
}

/* Removes the playlists set to undefined (i.e. deleted) */
function withoutUndefined(playlists: LoadedPlaylists): LoadedPlaylists {
  return Object.fromEntries(
    Object.entries(playlists).filter(([, playlist]) => playlist !== undefined),
  );
}

/* A playlist with the defaults for a newly loaded playlist. Uses the search
 * cached before the playlist loaded */
function withPlaylistDefaults(
  playlist: ServerPlaylist & Pick<Playlist, "sortKey" | "ascending">,
): Playlist {
  const { name } = playlist;
  const search = initialPlaylistsSearch.get(name) ?? "";
  initialPlaylistsSearch.delete(name);
  return { ...playlist, selection: new Map(), search, index: null };
}

function mergeSelection(newTracks: string[], selection: Selection): Selection {
  const newSelection: Selection = new Map();
  for (const [index, id] of selection) {
    if (newTracks[index] === id) {
      newSelection.set(index, id);
    }
  }
  return newSelection;
}

function mergePlaylists(
  playlist: Playlist,
  newPlaylist: ServerPlaylist,
): Playlist {
  const { index, selection, tracks } = playlist;
  const { tracks: newTracks } = newPlaylist;
  let newIndex = null;
  if (index != null && tracks[index] === newTracks[index]) {
    newIndex = index;
  }
  const newSelection = mergeSelection(newTracks, selection);
  return {
    ...playlist,
    tracks: newTracks,
    selection: newSelection,
    index: newIndex,
  };
}

/* Only library playlists support sorting */
function getDefaultLibraryPlaylist(playlistName: string): Playlist {
  const sortKey = initialPlaylistsSortKey.get(playlistName) ?? "title";
  const ascending = initialPlaylistsAscending.get(playlistName) ?? true;
  initialPlaylistsAscending.delete(playlistName);
  initialPlaylistsSortKey.delete(playlistName);
  /* Tracks are set when the library is added */
  return withPlaylistDefaults({
    name: playlistName,
    tracks: [],
    sortKey,
    ascending,
  });
}

function getDefaultPlaylist(): Playlist {
  return withPlaylistDefaults({ name: NOW_PLAYING_NAME, tracks: [] });
}

function trackNext(
  newPlaylists: LoadedPlaylists,
  playlistName: string,
  id: string,
  index: number,
): LoadedPlaylists {
  /* Add track to default playlist by default.
   * Unless it is part of certain playlists. */
  if (shouldAddToDefaultPlaylist(playlistName)) {
    const defaultPlaylist = getPlaylist(newPlaylists, NOW_PLAYING_NAME);
    const { tracks } = defaultPlaylist;
    newPlaylists[NOW_PLAYING_NAME] = {
      ...defaultPlaylist,
      tracks: [...tracks, id],
      index: tracks.length,
    };
  }

  /* Update playlist play id */
  newPlaylists[playlistName] = {
    ...getPlaylist(newPlaylists, playlistName),
    index,
  };
  return newPlaylists;
}

function invert(m: Selection): Map<string, number> {
  const inverted = new Map<string, number>();
  for (const [k, v] of m) {
    inverted.set(v, k);
  }
  return inverted;
}

/* The track's value for the sort key. The sort key comes from the url, so
 * it may not be a track attribute */
function getSortValue(lib: Library, trackId: string, sortKey: string): unknown {
  const track = lib[trackId];
  return track ? (track as unknown as Record<string, unknown>)[sortKey] : null;
}

function getSortString(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function sortPlaylist(
  tracks: string[],
  lib: Library,
  sortKey: string | undefined,
  ascending: boolean | undefined,
  index: number | null,
  selection: Selection,
): { newIndex: number | null; newSelection: Selection } {
  const factor = ascending ? 1 : -1;
  const indexTrack = index != null && tracks[index];
  const key = sortKey ?? "";
  if (key === "duration" || key === "createdAt") {
    tracks.sort(
      (a, b) =>
        factor *
        (Number(getSortValue(lib, a, key)) - Number(getSortValue(lib, b, key))),
    );
  } else {
    tracks.sort((a, b) => {
      const valueA = getSortString(getSortValue(lib, a, key));
      const valueB = getSortString(getSortValue(lib, b, key));
      return factor * valueA.localeCompare(valueB);
    });
  }

  let newIndex: number | null;
  if (indexTrack) {
    // Possible to binary search here
    newIndex = tracks.findIndex((track) => track === indexTrack);
  } else {
    newIndex = null;
  }

  let newSelection: Selection;
  if (selection.size) {
    const invertedSelection = invert(selection);
    newSelection = new Map();
    tracks.forEach((track, i) => {
      if (invertedSelection.has(track)) {
        newSelection.set(i, track);
      }
    });
  } else {
    newSelection = selection;
  }
  return { newIndex, newSelection };
}

function playlistAdd(
  addTracks: string[],
  playlistName: string,
  playlists: Playlists,
): Playlist {
  const playlist = playlists?.[playlistName];
  if (playlist) {
    const { tracks } = playlist;
    return { ...playlist, tracks: tracks.concat(addTracks) };
  }
  if (!playlists) {
    /* Playlists must be loaded before adding to one */
    throw new Error(`Cannot add to playlist ${playlistName} before loading`);
  }
  return withPlaylistDefaults({ name: playlistName, tracks: addTracks });
}

function tracksDeleteFromPlaylist(
  playlist: Playlist,
  deleteIds: Set<string>,
): Playlist {
  const { selection, tracks } = playlist;
  let { index } = playlist;
  const filteredSelection: Selection = new Map();
  const filteredTracks: string[] = [];
  let numDeleted = 0;
  let indexOffset = 0;
  tracks.forEach((track, i) => {
    if (deleteIds.has(track)) {
      if (index != null) {
        if (i === index) {
          index = null;
        } else if (i < index) {
          indexOffset += 1;
        }
      }
      numDeleted += 1;
    } else {
      filteredTracks.push(track);
      if (selection.has(i)) {
        filteredSelection.set(i - numDeleted, track);
      }
    }
  });
  if (index) {
    index -= indexOffset;
  }
  return {
    ...playlist,
    selection: filteredSelection,
    tracks: filteredTracks,
    index,
  };
}

export { reducerPlaylists };
