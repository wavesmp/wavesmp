import type { JSX } from "react";
import { memo, useCallback } from "react";
import { Link, useLocation } from "react-router";

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
import { getLibraryPlaylistSearch } from "src/selectors";

import { playlistColumns } from "../table/columns";
import type { OnItemEdit } from "../table/tableTypes";
import { TablePage } from "../tablepage";
import { selectPageProps } from "../tablepage/pageProps";

const NO_DATA_MSG = "Empty playlist. Go ahead and add some tracks!";

const NowPlaying = memo(function NowPlaying(): JSX.Element {
  const location = useLocation();
  const actions = useActions();
  const selectorState = useSelectorState();
  const menubar = useMenubar();
  const sidebar = useSidebar();
  const layout = useLayout();
  const props = selectPageProps(
    { ...selectorState, menubar, layout },
    location,
    playlistName,
    LIBRARY_NAME,
    playlistColumns,
  );
  const libraryPlaylistSearch = getLibraryPlaylistSearch(selectorState);

  const onClear = (): void => {
    actions.modalSet({ type: modalTypes.PLAYLIST_CLEAR });
  };

  const onPlaylistSave = (): void => {
    actions.modalSet({ type: modalTypes.PLAYLIST_SAVE });
  };

  function getButtons(): JSX.Element[] {
    if (sidebar) {
      const to = { pathname: routes.library, search: libraryPlaylistSearch };
      return [
        <Link key="Library" className="btn btn-primary" to={to}>
          Library
        </Link>,
      ];
    }
    return [
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
  }

  /* Stable, since it is passed down to every table cell */
  const onItemEdit = useCallback<OnItemEdit>(
    (id, attr, update) => {
      void actions.tracksInfoUpdate(id, attr, update, LIBRARY_NAME);
    },
    [actions],
  );

  return (
    <TablePage
      {...props}
      actions={actions}
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

export { NowPlaying };
