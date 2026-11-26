import { assert, describe, it } from "vitest";

import type { Playlist, Selection } from "src/types/playlistTypes";

import { reorder } from "./reorder";

const tracks = [...Array(10).keys()];

interface TestPlaylist {
  selection: Map<number, number>;
  tracks: number[];
  index: number | null;
}

interface TestReordered {
  reordered: unknown[];
  newSelection: Map<number, unknown>;
  newIndex: number | null;
}

/* The track ids are numbers here, so the expected orders are easy to read */
function testReorder(
  playlist: TestPlaylist,
  filteredSelection: Map<number, number>,
  insertAt: number,
): TestReordered {
  return reorder(
    playlist as unknown as Playlist,
    filteredSelection as unknown as Selection,
    insertAt,
  );
}

describe("#reorder()", () => {
  it("Move element up before play index", () => {
    const index = 3;
    const selection = new Map<number, number>();
    selection.set(0, 0);
    selection.set(1, 1);
    selection.set(6, 6);

    const playlist = { selection, tracks, index };
    const filteredSelection = new Map<number, number>();
    filteredSelection.set(6, 6);
    const insertAt = 2;
    const { reordered, newSelection, newIndex } = testReorder(
      playlist,
      filteredSelection,
      insertAt,
    );

    const expectedReordered = [0, 1, 6, 2, 3, 4, 5, 7, 8, 9];
    assert.deepEqual(reordered, expectedReordered);

    const expectedNewSelection = new Map();
    expectedNewSelection.set(0, 0);
    expectedNewSelection.set(1, 1);
    expectedNewSelection.set(2, 6);
    assert.deepEqual(newSelection, expectedNewSelection);

    assert.strictEqual(newIndex, 4);
  });

  it("Move element to play index", () => {
    const index = 3;
    const selection = new Map<number, number>();
    selection.set(0, 0);
    selection.set(1, 1);
    selection.set(6, 6);

    const playlist = { selection, tracks, index };
    const filteredSelection = new Map<number, number>();
    filteredSelection.set(6, 6);
    const insertAt = 3;
    const { reordered, newSelection, newIndex } = testReorder(
      playlist,
      filteredSelection,
      insertAt,
    );

    const expectedReordered = [0, 1, 2, 6, 3, 4, 5, 7, 8, 9];
    assert.deepEqual(reordered, expectedReordered);

    const expectedNewSelection = new Map();
    expectedNewSelection.set(0, 0);
    expectedNewSelection.set(1, 1);
    expectedNewSelection.set(3, 6);
    assert.deepEqual(newSelection, expectedNewSelection);

    assert.strictEqual(newIndex, 4);
  });

  it("Move element down after play index", () => {
    const index = 5;
    const selection = new Map<number, number>();
    selection.set(0, 0);
    selection.set(1, 1);
    selection.set(3, 3);

    const playlist = { selection, tracks, index };
    const filteredSelection = new Map<number, number>();
    filteredSelection.set(1, 1);
    filteredSelection.set(3, 3);
    const insertAt = 6;
    const { reordered, newSelection, newIndex } = testReorder(
      playlist,
      filteredSelection,
      insertAt,
    );

    const expectedReordered = [0, 2, 4, 5, 1, 3, 6, 7, 8, 9];
    assert.deepEqual(reordered, expectedReordered);

    const expectedNewSelection = new Map();
    expectedNewSelection.set(0, 0);
    expectedNewSelection.set(4, 1);
    expectedNewSelection.set(5, 3);
    assert.deepEqual(newSelection, expectedNewSelection);

    assert.strictEqual(newIndex, 3);
  });

  it("Move element down to play index", () => {
    const index = 6;
    const selection = new Map<number, number>();
    selection.set(0, 0);
    selection.set(1, 1);
    selection.set(3, 3);

    const playlist = { selection, tracks, index };
    const filteredSelection = new Map<number, number>();
    filteredSelection.set(1, 1);
    filteredSelection.set(3, 3);
    const insertAt = 6;
    const { reordered, newSelection, newIndex } = testReorder(
      playlist,
      filteredSelection,
      insertAt,
    );

    const expectedReordered = [0, 2, 4, 5, 1, 3, 6, 7, 8, 9];
    assert.deepEqual(reordered, expectedReordered);

    const expectedNewSelection = new Map();
    expectedNewSelection.set(0, 0);
    expectedNewSelection.set(4, 1);
    expectedNewSelection.set(5, 3);
    assert.deepEqual(newSelection, expectedNewSelection);

    assert.strictEqual(newIndex, 6);
  });

  it("Move element down to play index", () => {
    const index = 6;
    const selection = new Map<number, number>();
    selection.set(0, 0);
    selection.set(1, 1);
    selection.set(3, 3);

    const playlist = { selection, tracks, index };
    const filteredSelection = new Map<number, number>();
    filteredSelection.set(1, 1);
    filteredSelection.set(3, 3);
    const insertAt = 6;
    const { reordered, newSelection, newIndex } = testReorder(
      playlist,
      filteredSelection,
      insertAt,
    );

    const expectedReordered = [0, 2, 4, 5, 1, 3, 6, 7, 8, 9];
    assert.deepEqual(reordered, expectedReordered);

    const expectedNewSelection = new Map();
    expectedNewSelection.set(0, 0);
    expectedNewSelection.set(4, 1);
    expectedNewSelection.set(5, 3);
    assert.deepEqual(newSelection, expectedNewSelection);

    assert.strictEqual(newIndex, 6);
  });

  it("Reorder multiple", () => {
    const index = 5;
    const selection = new Map<number, number>();
    selection.set(0, 0);
    selection.set(2, 2);
    selection.set(4, 4);
    selection.set(6, 6);
    selection.set(8, 8);

    const filteredSelection = new Map<number, number>();
    filteredSelection.set(0, 0);
    filteredSelection.set(4, 4);
    filteredSelection.set(6, 6);
    filteredSelection.set(8, 8);

    const playlist = { selection, tracks, index };
    const insertAt = 6;
    const { reordered, newSelection, newIndex } = testReorder(
      playlist,
      filteredSelection,
      insertAt,
    );

    const expectedReordered = [1, 2, 3, 5, 0, 4, 6, 8, 7, 9];
    assert.deepEqual(reordered, expectedReordered);

    const expectedNewSelection = new Map();
    expectedNewSelection.set(2, 2);
    expectedNewSelection.set(4, 0);
    expectedNewSelection.set(5, 4);
    expectedNewSelection.set(6, 6);
    expectedNewSelection.set(7, 8);
    assert.deepEqual(newSelection, expectedNewSelection);

    assert.strictEqual(newIndex, 3);
  });

  it("Reorder multiple with play index", () => {
    const index = 4;
    const selection = new Map<number, number>();
    selection.set(0, 0);
    selection.set(2, 2);
    selection.set(4, 4);
    selection.set(6, 6);
    selection.set(8, 8);

    const filteredSelection = new Map<number, number>();
    filteredSelection.set(0, 0);
    filteredSelection.set(4, 4);
    filteredSelection.set(6, 6);
    filteredSelection.set(8, 8);

    const playlist = { selection, tracks, index };
    const insertAt = 6;
    const { reordered, newSelection, newIndex } = testReorder(
      playlist,
      filteredSelection,
      insertAt,
    );

    const expectedReordered = [1, 2, 3, 5, 0, 4, 6, 8, 7, 9];
    assert.deepEqual(reordered, expectedReordered);

    const expectedNewSelection = new Map();
    expectedNewSelection.set(2, 2);
    expectedNewSelection.set(4, 0);
    expectedNewSelection.set(5, 4);
    expectedNewSelection.set(6, 6);
    expectedNewSelection.set(7, 8);
    assert.deepEqual(newSelection, expectedNewSelection);

    assert.strictEqual(newIndex, 5);
  });
});
