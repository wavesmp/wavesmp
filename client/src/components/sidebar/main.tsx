import type { JSX } from "react";
import { memo } from "react";
import { Link } from "react-router";

import * as constants from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";
import type { Playlist, Playlists } from "src/types/playlistTypes";

interface MainBarProps {
  /* Hidden while the other bar is shown. Stays mounted to animate */
  hidden: boolean;
  actions: BoundActions;
  pathname: string;
  playlists: Playlists;
  isSliderVisible: boolean;
}

const MainBar = memo(function MainBar(props: MainBarProps): JSX.Element {
  const onPlaylistClick = (): void => {
    const { actions } = props;
    actions.sidebarSet(true);
  };

  const { pathname, playlists, isSliderVisible, hidden } = props;
  let className = "sidebar-container sidebar-container-narrow";
  if (isSliderVisible) {
    className += " sidebar-container-player-visible";
  }
  if (hidden) {
    className += " sidebar-container-hidden";
  }

  const menuBarItems = [
    {
      name: "Now Playing",
      pathname: constants.routes.nowplaying,
      playlistName: constants.NOW_PLAYING_NAME,
      className: "fa-fw fa fa-lg fa-headphones",
    },
    {
      name: "Library",
      pathname: constants.routes.library,
      playlistName: constants.LIBRARY_NAME,
      className: "fa-fw fa fa-lg fa-book",
    },
  ];
  return (
    <div className={className}>
      <ul className="nav">
        {menuBarItems.map((sample) => (
          <PlaylistLink
            key={sample.name}
            itemPathname={sample.pathname}
            playlist={playlists?.[sample.playlistName]}
            className={sample.className}
            pathname={pathname}
          />
        ))}
        <li>
          <span onClick={onPlaylistClick}>
            <i className="fa-fw fa fa-lg fa-list" />
          </span>
        </li>
        <li>
          <Link
            className={
              pathname === constants.routes.upload ? "sidebar-active" : ""
            }
            to={constants.routes.upload}
          >
            <i className="fa-fw fa fa-lg fa-cloud-upload" />
          </Link>
        </li>
        <li>
          <Link
            className={
              pathname === constants.routes.settings ? "sidebar-active" : ""
            }
            to={constants.routes.settings}
          >
            <i className="fa-fw fa fa-lg fa-cog" />
          </Link>
        </li>
      </ul>
    </div>
  );
});

interface PlaylistLinkProps {
  itemPathname: string;
  playlist: Playlist | undefined;
  pathname: string;
  className: string;
}

const PlaylistLink = memo(function PlaylistLink(
  props: PlaylistLinkProps,
): JSX.Element {
  const { itemPathname, playlist, pathname, className } = props;
  const activeClassName = pathname === itemPathname ? "sidebar-active" : "";
  const search = playlist?.search ?? "";
  const to = { pathname: itemPathname, search };
  return (
    <li>
      <Link className={activeClassName} to={to}>
        <i className={className} />
      </Link>
    </li>
  );
});

export { MainBar };
