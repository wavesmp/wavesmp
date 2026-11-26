import type { JSX } from "react";
import { memo, useCallback } from "react";
import { Link, useLocation } from "react-router";

import { LIBRARY_NAME as playlistName, routes } from "src/constants";
import {
  useActions,
  useLayout,
  useMenubar,
  useSelectorState,
  useSidebar,
} from "src/providers/hooks";
import { getDefaultPlaylistSearch } from "src/selectors";

import { libraryColumns } from "../table/columns";
import type { OnItemEdit } from "../table/tableTypes";
import { TablePage } from "../tablepage";
import { selectPageProps } from "../tablepage/pageProps";

const NO_DATA_MSG = "Empty playlist. Go ahead and add some tracks!";

const Library = memo(function Library(): JSX.Element {
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
    playlistName,
    libraryColumns,
  );
  const defaultPlaylistSearch = getDefaultPlaylistSearch(selectorState);

  function getButtons(): JSX.Element[] | null {
    if (sidebar) {
      const to = { pathname: routes.nowplaying, search: defaultPlaylistSearch };
      return [
        <Link key="Now Playing" className="btn btn-primary" to={to}>
          Now Playing
        </Link>,
      ];
    }
    return null;
  }

  /* Stable, since it is passed down to every table cell */
  const onItemEdit = useCallback<OnItemEdit>(
    (id, attr, update) => {
      void actions.tracksInfoUpdate(id, attr, update, playlistName);
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
      title="Library"
    />
  );
});

export { Library };
