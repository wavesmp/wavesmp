import { memo, useCallback } from "react";
import { Link } from "react-router-dom";

import { LIBRARY_NAME, modalTypes, routes } from "src/constants";
import {
  useActions,
  useLayout,
  useMenubar,
  useSelectorState,
} from "src/providers/hooks";
import {
  getDefaultPlaylistSearch,
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors,
} from "src/selectors";

import { playlistColumns } from "../table/columns";
import { TablePage } from "../tablepage";

const NO_DATA_MSG = "Empty playlist. Go ahead and add some tracks!";

const Playlist = memo(function Playlist(ownProps) {
  const actions = useActions();
  const selectorState = useSelectorState();
  const menubar = useMenubar();
  const layout = useLayout();
  const stateProps = selectStateProps(
    { ...selectorState, menubar, layout },
    ownProps,
  );
  const props = { ...ownProps, ...stateProps, actions };

  function getButtons() {
    const { libraryPlaylistSearch, defaultPlaylistSearch } = props;
    const toLibrary = {
      pathname: routes.library,
      search: libraryPlaylistSearch,
    };
    const toNowPlaying = {
      pathname: routes.nowplaying,
      search: defaultPlaylistSearch,
    };
    return [
      <Link key="Library" className="btn btn-primary" to={toLibrary}>
        Library
      </Link>,
      <Link key="Now Playing" className="btn btn-primary" to={toNowPlaying}>
        Now Playing
      </Link>,
    ];
  }

  const onSettingsClick = () => {
    const { actions, playlistName } = props;
    actions.modalSet({
      type: modalTypes.PLAYLIST_SETTINGS,
      props: { playlistName },
    });
  };

  /* Stable, since it is passed down to every table cell */
  const onItemEdit = useCallback(
    (id, attr, update) => {
      actions.tracksInfoUpdate(id, attr, update, LIBRARY_NAME);
    },
    [actions],
  );

  const { playlistName } = props;
  return (
    <TablePage
      {...props}
      buttons={getButtons()}
      draggable
      orderable
      noDataMsg={NO_DATA_MSG}
      onItemEdit={onItemEdit}
      onSettingsClick={onSettingsClick}
      title={playlistName}
    />
  );
});

function selectStateProps(state, ownProps) {
  const playlistName = ownProps.match.params.playlist;
  const { getRouterSearchString, getRouterQueryParams, getPlaylistProps } =
    getOrCreatePlaylistSelectors(playlistName, URLSearchParams, LIBRARY_NAME);
  const { tracks, account, menubar, layout } = state;
  const { playing } = tracks;
  const { isPlaying } = playing;
  const { location } = ownProps;
  const { pathname, search } = location;
  const { theme } = account;
  const columns = playlistColumns.filter((c) => account.columns.has(c.title));

  return {
    qp: getRouterQueryParams(undefined, search),
    routerSearchString: getRouterSearchString(undefined, search),
    libraryPlaylistSearch: getLibraryPlaylistSearch(state),
    defaultPlaylistSearch: getDefaultPlaylistSearch(state),
    playlistName,
    pathname,
    isPlaying,
    columns,
    menubar,
    theme,
    layout,
    ...getPlaylistProps(state, search),
  };
}

export { Playlist };
