import { memo, useCallback } from "react";
import { Link } from "react-router-dom";

import {
  LIBRARY_NAME,
  modalTypes,
  NOW_PLAYING_NAME as playlistName,
  routes,
} from "src/constants";
import {
  useActions,
  useLayout,
  useMenubar,
  useSelectorState,
  useSidebar,
} from "src/providers/hooks";
import {
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors,
} from "src/selectors";

import { playlistColumns } from "../table/columns";
import { TablePage } from "../tablepage";

const NO_DATA_MSG = "Empty playlist. Go ahead and add some tracks!";

const NowPlaying = memo(function NowPlaying(ownProps) {
  const actions = useActions();
  const selectorState = useSelectorState();
  const menubar = useMenubar();
  const sidebar = useSidebar();
  const layout = useLayout();
  const stateProps = selectStateProps(
    { ...selectorState, menubar, sidebar, layout },
    ownProps,
  );
  const props = { ...ownProps, ...stateProps, actions };

  const onClear = () => {
    const { actions } = props;
    actions.modalSet({ type: modalTypes.PLAYLIST_CLEAR });
  };

  const onPlaylistSave = () => {
    const { actions } = props;
    actions.modalSet({ type: modalTypes.PLAYLIST_SAVE });
  };

  const defaultButtons = [
    <button
      key="Clear"
      className="btn btn-primary"
      type="button"
      onClick={onClear}
    >
      Clear
    </button>,
    <button
      key="Save"
      className="btn btn-primary"
      type="button"
      onClick={onPlaylistSave}
    >
      Save
    </button>,
  ];

  function getPlaylistButtons() {
    const { libraryPlaylistSearch } = props;
    const to = { pathname: routes.library, search: libraryPlaylistSearch };
    return [
      <Link key="Library" className="btn btn-primary" to={to}>
        Library
      </Link>,
    ];
  }

  function getButtons() {
    const { sidebar } = props;
    if (sidebar) {
      return getPlaylistButtons();
    }
    return defaultButtons;
  }

  /* Stable, since it is passed down to every table cell */
  const onItemEdit = useCallback(
    (id, attr, update) => {
      actions.tracksInfoUpdate(id, attr, update, LIBRARY_NAME);
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
      title="Now Playing"
    />
  );
});

function selectStateProps(state, ownProps) {
  const { getRouterQueryParams, getRouterSearchString, getPlaylistProps } =
    getOrCreatePlaylistSelectors(playlistName, URLSearchParams, LIBRARY_NAME);
  const { tracks, account, menubar, sidebar, layout } = state;
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

export { NowPlaying };
