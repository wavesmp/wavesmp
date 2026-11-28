import { assert, describe, it } from "vitest";

import { LIBRARY_NAME, NOW_PLAYING_NAME } from "src/constants";
import { asState, newTrackId } from "src/testUtil";
import {
  TEST_TRACK1 as baseTrack1,
  TEST_TRACK2 as baseTrack2,
  TEST_PLAYLIST_NAME1 as testPlaylistName,
  TEST_SEARCH as testSearch,
} from "src/testUtil/testData";
import type { SelectorState } from "src/types/stateTypes";

import {
  getDefaultPlaylistSearch,
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors,
} from "./index";

const ORDER_QUERY_KEY = "order";
const SEARCH_QUERY_KEY = "search";
const SORT_KEY_QUERY_KEY = "sortKey";

const DEFAULT_ASCENDING = true;
const DEFAULT_SORT_KEY = "title";
const DEFAULT_SEARCH_STRING = "";

const testIndex = 0;
const testSortKey = "artist";
const testAscending = false;

const track1 = { ...baseTrack1, id: newTrackId() };
const track2 = { ...baseTrack2, id: newTrackId() };

const libName = "testLibName";
const testLib = {
  [track1.id]: track1,
  [track2.id]: track2,
};
const libraries = {
  [libName]: testLib,
};

describe("waves-client-selectors", () => {
  const combined: [string, (state: SelectorState) => string][] = [
    [NOW_PLAYING_NAME, getDefaultPlaylistSearch],
    [LIBRARY_NAME, getLibraryPlaylistSearch],
  ];

  for (const [playlistName, getPlaylistSearch] of combined) {
    describe(`get ${playlistName} playlist search`, () => {
      it("playlists is null", () => {
        const tracks = {
          playlists: null,
        };
        const state = { tracks };
        const search = getPlaylistSearch(asState(state));
        assert.strictEqual(search, "");
      });

      it("playlist is null", () => {
        const tracks = {
          playlists: {},
        };
        const state = { tracks };
        const search = getPlaylistSearch(asState(state));
        assert.strictEqual(search, "");
      });

      it("Search is empty string", () => {
        const tracks = {
          playlists: {
            [playlistName]: {
              search: "",
            },
          },
        };
        const state = { tracks };
        const search = getPlaylistSearch(asState(state));
        assert.strictEqual(search, "");
      });

      it("test search string", () => {
        const tracks = {
          playlists: {
            [playlistName]: {
              search: testSearch,
            },
          },
        };
        const state = { tracks };
        const search = getPlaylistSearch(asState(state));
        assert.strictEqual(search, testSearch);
      });
    });
  }

  describe("#getOrCreatePlaylistSelectors()", () => {
    const {
      getRouterSearchString,
      getRouterAscending,
      getRouterSortKey,
      getPlaylistProps,
      getSearchItems,
    } = getOrCreatePlaylistSelectors(
      testPlaylistName,
      URLSearchParams,
      libName,
    );

    describe("#getPlaylistProps()", () => {
      it("playlist is null", () => {
        const tracks = {
          playlists: null,
          libraries,
        };
        const state = { tracks, account: { rowsPerPage: 25 } };
        const props = getPlaylistProps(asState(state), "");
        assert.deepEqual(props, { loaded: false });
      });

      it("playlist is missing", () => {
        const playlists = {};
        const tracks = { playlists, libraries };
        const state = { tracks, account: { rowsPerPage: 25 } };
        const props = getPlaylistProps(asState(state), "");
        assert.deepEqual(props, { loaded: false });
      });

      it("playlist exists", () => {
        const testSelection = new Map([[0, track1.id]]);
        const playlist = {
          tracks: [track1.id],
          index: testIndex,
          selection: testSelection,
          sortKey: testSortKey,
          ascending: testAscending,
        };
        const playlists = {
          [testPlaylistName]: playlist,
        };

        const tracks = { playlists, libraries };
        const state = { tracks, account: { rowsPerPage: 25 } };
        const props = getPlaylistProps(asState(state), "");
        const expected = {
          loaded: true,
          index: testIndex,
          selection: testSelection,
          sortKey: testSortKey,
          ascending: testAscending,
          numItems: 1,
          currentPage: 0,
          lastPage: 0,
          displayItems: [
            {
              ...track1,
              index: 0,
              time: "1:01",
            },
          ],
        };
        assert.deepEqual(props, expected);
      });
    });

    describe("router values", () => {
      it(`${SEARCH_QUERY_KEY} default value`, () => {
        assert.strictEqual(
          getRouterSearchString(undefined, ""),
          DEFAULT_SEARCH_STRING,
        );
      });

      it(`${ORDER_QUERY_KEY} default value`, () => {
        assert.strictEqual(
          getRouterAscending(undefined, ""),
          DEFAULT_ASCENDING,
        );
      });

      it(`${SORT_KEY_QUERY_KEY} default value`, () => {
        assert.strictEqual(getRouterSortKey(undefined, ""), DEFAULT_SORT_KEY);
      });

      it(`${SEARCH_QUERY_KEY} value`, () => {
        const expectedParam = "dummy";
        const search = `foo=bar&${SEARCH_QUERY_KEY}=${expectedParam}&hi=bye`;
        assert.strictEqual(
          getRouterSearchString(undefined, search),
          expectedParam,
        );
      });

      it(`${ORDER_QUERY_KEY} true value`, () => {
        const param = "asc";
        const search = `foo=bar&${ORDER_QUERY_KEY}=${param}&hi=bye`;
        assert.strictEqual(getRouterAscending(undefined, search), true);
      });

      it(`${ORDER_QUERY_KEY} false value`, () => {
        const param = "desc";
        const search = `foo=bar&${ORDER_QUERY_KEY}=${param}&hi=bye`;
        assert.strictEqual(getRouterAscending(undefined, search), false);
      });

      it(`${SORT_KEY_QUERY_KEY} value`, () => {
        const expectedParam = "dummy";
        const search = `foo=bar&${SORT_KEY_QUERY_KEY}=${expectedParam}&hi=bye`;
        assert.strictEqual(getRouterSortKey(undefined, search), expectedParam);
      });
    });

    describe("#getSearchItems()", () => {
      it("search has 0 hits", () => {
        const searchString = "thisdoesnotmatchanything";
        const search = `${SEARCH_QUERY_KEY}=${searchString}`;
        const playlists = {
          [testPlaylistName]: {
            tracks: [track1.id, track2.id],
          },
        };
        const tracks = { playlists, libraries };
        const state = { tracks };
        const searchItems = getSearchItems(asState(state), search) ?? [];
        assert.lengthOf(searchItems, 0);
      });

      it("search has a hit", () => {
        const searchString = "thisisaveryspecificsearchstring";

        const track1Copy = { ...track1, title: searchString };
        const libCopy = { ...libraries[libName], [track1Copy.id]: track1Copy };
        const librariesCopy = { ...libraries, [libName]: libCopy };

        const search = `${SEARCH_QUERY_KEY}=${searchString}`;
        const playlists = {
          [testPlaylistName]: {
            tracks: [track1Copy.id, track2.id],
          },
        };
        const tracks = { playlists, libraries: librariesCopy };
        const state = { tracks };
        const searchItems = getSearchItems(asState(state), search) ?? [];
        assert.lengthOf(searchItems, 1);
        assert.strictEqual(searchItems[0]?.id, track1Copy.id);
      });
    });
  });
});
