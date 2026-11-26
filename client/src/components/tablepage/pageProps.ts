import type { Location } from "react-router";

import type { useSelectorState } from "src/providers/hooks";
import type { PlaylistProps } from "src/selectors";
import { getOrCreatePlaylistSelectors } from "src/selectors";
import type { Layout } from "src/types/stateTypes";

import type { Column } from "../table/tableTypes";

type PageState = ReturnType<typeof useSelectorState> & {
  menubar: boolean;
  layout: Layout;
};

/* The props of a playlist's table page, from the state and the url */
type PageStateProps = {
  qp: URLSearchParams;
  routerSearchString: string;
  pathname: string;
  isPlaying: boolean;
  columns: Column[];
  menubar: boolean;
  theme: string;
  layout: Layout;
} & PlaylistProps;

function selectPageProps(
  state: PageState,
  location: Pick<Location, "pathname" | "search">,
  playlistName: string,
  libName: string,
  allColumns: Column[],
): PageStateProps {
  const { getRouterSearchString, getRouterQueryParams, getPlaylistProps } =
    getOrCreatePlaylistSelectors(playlistName, URLSearchParams, libName);
  const { tracks, account, menubar, layout } = state;
  const { isPlaying } = tracks.playing;
  const { pathname, search } = location;
  const { theme } = account;
  const columns = allColumns.filter((c) => account.columns?.has(c.title));

  return {
    qp: getRouterQueryParams(undefined, search),
    routerSearchString: getRouterSearchString(undefined, search),
    pathname,
    isPlaying,
    columns,
    menubar,
    theme,
    layout,
    ...getPlaylistProps(state, search),
  };
}

export { selectPageProps };
