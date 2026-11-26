import type { Playlist, Selection } from "src/types/playlistTypes";

interface Reordered {
  reordered: string[];
  newSelection: Selection;
  newIndex: number | null;
}

/* Moves the filtered selection to insertAt. Returns the reordered tracks,
 * and the selection and playing index updated for the new order */
function reorder(
  playlist: Playlist,
  filteredSelection: Selection,
  insertAt: number,
): Reordered {
  const { tracks, selection, index } = playlist;
  const trackAt = (i: number): string => {
    const track = tracks[i];
    if (track === undefined) {
      throw new Error(`No track at ${i.toString()}`);
    }
    return track;
  };
  const filteredSelectionKeys = Array.from(filteredSelection.keys()).sort(
    (a, b) => a - b,
  );
  const reordered: string[] = [];
  const newSelection: Selection = new Map();
  let newIndex: number | null = null;
  let indexOffset = 0;

  /* Section before filtered selection or insertAt is preserved.
   * Filtered selection has at least one item due to drag n drop logic */
  const firstStop = Math.min(insertAt, filteredSelectionKeys[0] ?? Infinity);
  let i = 0;
  while (i < firstStop) {
    const track = trackAt(i);
    if (selection.has(i)) {
      newSelection.set(i, track);
    }
    reordered.push(track);
    i += 1;
  }

  while (i < insertAt) {
    if (filteredSelection.has(i)) {
      if (index != null && index > i && index < insertAt) {
        indexOffset -= 1;
      }
    } else {
      const track = trackAt(i);
      if (selection.has(i)) {
        newSelection.set(i, track);
      }
      reordered.push(track);
    }
    i += 1;
  }

  for (const [j, track] of filteredSelectionKeys.map(
    (key): [number, string | undefined] => [key, filteredSelection.get(key)],
  )) {
    if (track === undefined) {
      continue;
    }
    if (j === index) {
      newIndex = reordered.length;
    }
    newSelection.set(reordered.length, track);
    reordered.push(track);
  }

  const filteredSelectionStop = getLast(filteredSelectionKeys) ?? -1;
  while (i <= filteredSelectionStop) {
    if (filteredSelection.has(i)) {
      if (index != null && index < i && index >= insertAt) {
        indexOffset += 1;
      }
    } else {
      const track = trackAt(i);
      if (selection.has(i)) {
        newSelection.set(i, track);
      }
      reordered.push(track);
    }
    i += 1;
  }

  while (i < tracks.length) {
    const track = trackAt(i);
    if (selection.has(i)) {
      newSelection.set(i, track);
    }
    reordered.push(track);
    i += 1;
  }

  if (newIndex == null && index != null) {
    newIndex = index + indexOffset;
  }

  return { reordered, newSelection, newIndex };
}

function getLast<T>(A: readonly T[]): T | undefined {
  return A[A.length - 1];
}

export { reorder };
