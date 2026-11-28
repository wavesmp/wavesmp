import { actionTypes } from "src/actionTypes";
import type { Thunk } from "src/types/actionTypes";
import type { Library, ServerTrack, Track } from "src/types/trackTypes";

function tracksAdd(
  update: readonly (ServerTrack | Track)[],
  libName: string,
): Thunk<void> {
  return (dispatch, getState) => {
    /* Extract existing library */
    const { tracks } = getState();
    const { libraries } = tracks;
    const libraryById: Library = { ...libraries[libName] };

    /* Apply and dispatch update */
    for (const item of update) {
      libraryById[item.id] = toLibraryTrack(item);
    }
    dispatch({ type: actionTypes.TRACKS_ADD, lib: libraryById, libName });
  };
}

/* Fills in missing tags, and the creation time, which comes from the id */
function toLibraryTrack(item: ServerTrack | Track): Track {
  const epoch = parseInt(item.id.substring(0, 8), 16);
  return {
    ...item,
    title: tagOrUnknown(item.title, "title"),
    artist: tagOrUnknown(item.artist, "artist"),
    genre: tagOrUnknown(item.genre, "genre"),
    createdAt: epoch,
    createdAtPretty: new Date(epoch * 1000).toLocaleString(),
  };
}

/* Missing or empty tags are shown as unknown */
function tagOrUnknown(value: string | null | undefined, tag: string): string {
  if (!value) {
    return `Unknown ${tag}`;
  }
  return value;
}

export { tracksAdd };
