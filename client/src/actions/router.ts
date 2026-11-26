import { actionTypes } from "src/actionTypes";
import { LIBRARY_NAME, UPLOADS_NAME } from "src/constants";
import { getOrCreatePlaylistSelectors } from "src/selectors";
import type { Thunk } from "src/types/actionTypes";
import { getPlaylistNameFromRoute } from "src/utils";

/* Applies the url's search and sort to its playlist */
function routerChange(
  location: Pick<Location, "pathname" | "search">,
): Thunk<void> {
  return (dispatch, getState) => {
    const { pathname, search } = location;
    const playlistName = getPlaylistNameFromRoute(pathname);
    if (!playlistName) {
      return;
    }
    dispatch({
      type: actionTypes.PLAYLIST_SEARCH_UPDATE,
      name: playlistName,
      search,
    });
    if (playlistName === LIBRARY_NAME || playlistName === UPLOADS_NAME) {
      const libName = playlistName;
      const { getRouterAscending, getRouterSortKey } =
        getOrCreatePlaylistSelectors(playlistName, URLSearchParams, libName);
      const ascending = getRouterAscending(undefined, search);
      const sortKey = getRouterSortKey(undefined, search);
      const { libraries, playlists } = getState().tracks;
      const lib = libraries[libName];
      const playlist = playlists?.[playlistName];
      if (
        lib &&
        sortKey === playlist?.sortKey &&
        ascending === playlist.ascending
      ) {
        return;
      }
      dispatch({
        type: actionTypes.PLAYLIST_SORT,
        lib,
        name: playlistName,
        sortKey,
        ascending,
      });
    }
  };
}

export { routerChange };
