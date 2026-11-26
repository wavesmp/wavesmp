import type { JSX } from "react";
import { memo, useCallback } from "react";
import { Link, useLocation, useParams } from "react-router";

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
} from "src/selectors";

import { playlistColumns } from "../table/columns";
import type { OnItemEdit } from "../table/tableTypes";
import { TablePage } from "../tablepage";
import { selectPageProps } from "../tablepage/pageProps";

const NO_DATA_MSG = "Empty playlist. Go ahead and add some tracks!";

const Playlist = memo(function Playlist(): JSX.Element {
  const location = useLocation();
  const params = useParams();
  const actions = useActions();
  const selectorState = useSelectorState();
  const menubar = useMenubar();
  const layout = useLayout();
  /* Set by the route path (routes.playlist) */
  const playlistName = params.playlist ?? "";
  const props = selectPageProps(
    { ...selectorState, menubar, layout },
    location,
    playlistName,
    LIBRARY_NAME,
    playlistColumns,
  );
  const libraryPlaylistSearch = getLibraryPlaylistSearch(selectorState);
  const defaultPlaylistSearch = getDefaultPlaylistSearch(selectorState);

  function getButtons(): JSX.Element[] {
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

  const onSettingsClick = (): void => {
    actions.modalSet({
      type: modalTypes.PLAYLIST_SETTINGS,
      props: { playlistName },
    });
  };

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
      onSettingsClick={onSettingsClick}
      playlistName={playlistName}
      title={playlistName}
    />
  );
});

export { Playlist };
