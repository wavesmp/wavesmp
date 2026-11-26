import * as sinon from "sinon";
import { assert, describe, it } from "vitest";

import { actionTypes } from "src/actionTypes";
import {
  LIBRARY_NAME,
  NOW_PLAYING_NAME,
  UPLOADS_NAME,
  routes,
} from "src/constants";
import { callThunk, newTrackId } from "src/testUtil";
import {
  TEST_TRACK1 as baseTrack1,
  TEST_TRACK2 as baseTrack2,
  TEST_PLAYLIST_NAME1 as testPlaylistName,
  TEST_SEARCH as testSearch,
} from "src/testUtil/testData";
import { getPlaylistNameFromRoute } from "src/utils";

const track1 = { ...baseTrack1, id: newTrackId() };
const track2 = { ...baseTrack2, id: newTrackId() };
const lib = {
  [track1.id]: track1,
  [track2.id]: track2,
};
const libraries = {
  [LIBRARY_NAME]: lib,
  [UPLOADS_NAME]: lib,
};

import * as actions from "./router";

describe("#router()", () => {
  it("Router change on unknown path", () => {
    const location = {
      pathname: "/unknown",
      search: testSearch,
    };
    const thunk = actions.routerChange(location);

    callThunk(thunk);
  });

  it("Router change on default playlist", () => {
    const location = {
      pathname: "/nowplaying",
      search: testSearch,
    };
    const thunk = actions.routerChange(location);

    assert.isDefined(actionTypes.PLAYLIST_SEARCH_UPDATE);
    const action = {
      type: actionTypes.PLAYLIST_SEARCH_UPDATE,
      name: NOW_PLAYING_NAME,
      search: testSearch,
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    callThunk(thunk, dispatchMock);
    dispatchMock.verify();
  });

  it("Router change on custom playlist", () => {
    const location = {
      pathname: `/playlist/${testPlaylistName}`,
      search: testSearch,
    };
    const thunk = actions.routerChange(location);

    assert.isDefined(actionTypes.PLAYLIST_SEARCH_UPDATE);
    const action = {
      type: actionTypes.PLAYLIST_SEARCH_UPDATE,
      name: testPlaylistName,
      search: testSearch,
    };

    const dispatchMock = sinon.mock();
    dispatchMock.once().withExactArgs(action);

    callThunk(thunk, dispatchMock);
    dispatchMock.verify();
  });

  it("Router change on library playlist", () => {
    for (const pathname of [routes.library, routes.upload]) {
      const playlistName = getPlaylistNameFromRoute(pathname);
      const ascending = false;
      const order = "desc";
      const sortKey = "testSortKey";
      const search = `?page=2&search=foobar&sortKey=${sortKey}&order=${order}`;
      const location = { pathname, search };

      const thunk = actions.routerChange(location);

      assert.isDefined(actionTypes.PLAYLIST_SEARCH_UPDATE);
      const firstAction = {
        type: actionTypes.PLAYLIST_SEARCH_UPDATE,
        name: playlistName,
        search,
      };

      assert.isDefined(actionTypes.PLAYLIST_SORT);
      const secondAction = {
        type: actionTypes.PLAYLIST_SORT,
        lib,
        name: playlistName,
        sortKey,
        ascending,
      };

      const dispatchMock = sinon.mock();
      const dispatchExpect = dispatchMock.twice();

      const getState = (): unknown => ({ tracks: { libraries } });
      callThunk(thunk, dispatchMock, getState);

      const firstDispatchCall = dispatchExpect.firstCall;
      assert.isTrue(firstDispatchCall.calledWithExactly(firstAction));

      const secondDispatchCall = dispatchExpect.secondCall;
      assert.isTrue(secondDispatchCall.calledWithExactly(secondAction));

      dispatchMock.verify();
    }
  });
});
