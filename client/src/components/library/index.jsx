import { memo, useCallback } from "react";
import { Link } from "react-router-dom";

import { LIBRARY_NAME as playlistName, routes } from "src/constants";
import { useActions, useWavesSelector } from "src/providers/hooks";
import {
  getDefaultPlaylistSearch,
  getOrCreatePlaylistSelectors,
} from "src/selectors";

import { libraryColumns } from "../table/columns";
import { TablePage } from "../tablepage";

const NO_DATA_MSG = "Empty playlist. Go ahead and add some tracks!";

const Library = memo(function Library(ownProps) {
  const actions = useActions();
  const stateProps = useWavesSelector((state) =>
    selectStateProps(state, ownProps),
  );
  const props = { ...ownProps, ...stateProps, actions };

  function getPlaylistButtons() {
    const { defaultPlaylistSearch } = props;
    const to = { pathname: routes.nowplaying, search: defaultPlaylistSearch };
    return [
      <Link key="Now Playing" className="btn btn-primary" to={to}>
        Now Playing
      </Link>,
    ];
  }

  function getButtons() {
    const { sidebar } = props;
    if (sidebar) {
      return getPlaylistButtons();
    }
    return null;
  }

  const onItemEdit = useCallback(
    (id, attr, update) => {
      actions.tracksInfoUpdate(id, attr, update, playlistName);
    },
    [actions],
  );

  return (
    <TablePage
      {...props}
      buttons={getButtons()}
      draggable
      orderable
      noDataMsg={NO_DATA_MSG}
      onItemEdit={onItemEdit}
      playlistName={playlistName}
      title="Library"
    />
  );
});

function selectStateProps(state, ownProps) {
  const { getRouterSearchString, getRouterQueryParams, getPlaylistProps } =
    getOrCreatePlaylistSelectors(playlistName, URLSearchParams, playlistName);
  const { tracks, account, menubar, sidebar, layout } = state;
  const { playing } = tracks;
  const { isPlaying } = playing;
  const { location } = ownProps;
  const { pathname, search } = location;
  const { theme } = account;
  const columns = libraryColumns.filter((c) => account.columns.has(c.title));

  return {
    defaultPlaylistSearch: getDefaultPlaylistSearch(state),
    qp: getRouterQueryParams(undefined, search),
    routerSearchString: getRouterSearchString(undefined, search),
    pathname,
    isPlaying,
    columns,
    menubar,
    sidebar,
    theme,
    layout,
    ...getPlaylistProps(state, search),
  };
}

export { Library };
