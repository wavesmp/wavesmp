import type { DragEvent, JSX, Ref } from "react";
import { memo } from "react";
import { Link } from "react-router";

import * as constants from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";
import type { Playlist, Playlists } from "src/types/playlistTypes";

interface PlaylistBarProps {
  ref?: Ref<HTMLDivElement>;
  actions: BoundActions;
  playlists: Playlists;
  isSliderVisible: boolean;
}

const PlaylistBar = memo(function PlaylistBar({
  ref,
  ...props
}: PlaylistBarProps): JSX.Element {
  const onBackClick = (): void => {
    const { actions } = props;
    actions.sidebarSet(false);
  };

  function onDragOver(ev: DragEvent<HTMLElement>): void {
    if (ev.dataTransfer.types.includes(constants.PLAYLIST_TYPE)) {
      ev.preventDefault();
    }
  }

  const onNewPlaylistClick = (): void => {
    const { actions } = props;
    actions.modalSet({ type: constants.modalTypes.PLAYLIST_CREATE });
  };

  const onPlaylistDrop = (ev: DragEvent<HTMLElement>): void => {
    const { actions } = props;
    const playlistSrc = ev.dataTransfer.getData(constants.PLAYLIST_TYPE);
    if (!playlistSrc) {
      return;
    }
    const playlistDst = ev.currentTarget.getAttribute(
      constants.PLAYLIST_NAME_ATTR,
    );
    if (playlistDst === null) {
      return;
    }
    if (playlistDst === "__new") {
      actions.modalSet({
        type: constants.modalTypes.PLAYLIST_CREATE,
        props: { playlistSrc },
      });
    } else {
      actions.playlistAdd(playlistSrc, playlistDst);
    }
    ev.preventDefault();
  };

  const { playlists, isSliderVisible } = props;
  const playlistObjs = Object.values(playlists ?? {}).filter(
    (p): p is Playlist =>
      p !== undefined &&
      p.name !== constants.NOW_PLAYING_NAME &&
      p.name !== constants.LIBRARY_NAME &&
      p.name !== constants.UPLOADS_NAME,
  );
  let className = "sidebar-container-wide";
  if (isSliderVisible) {
    className += " sidebar-container-player-visible";
  }
  return (
    <div id="sidebar-container" className={className} ref={ref}>
      <ul className="nav">
        <li>
          <span onClick={onBackClick}>
            <i className="fa-fw fa fa-lg fa-arrow-left" />
            <span className="sidebar-back-text">Back</span>
          </span>
        </li>
        <li className="sidebar-playlist">
          <span
            onClick={onNewPlaylistClick}
            onDragOver={onDragOver}
            onDrop={onPlaylistDrop}
            data-playlistname="__new"
          >
            <i className="fa-fw fa fa-lg fa-plus" />
            <span>New Playlist</span>
          </span>
        </li>
        {playlistObjs.map((playlist) => (
          <li key={playlist.name} className="sidebar-playlist">
            <Link
              to={{
                pathname: `/playlist/${playlist.name}`,
                search: playlist.search,
              }}
              onDragOver={onDragOver}
              onDrop={onPlaylistDrop}
              data-playlistname={playlist.name}
            >
              <i className="fa-fw fa fa-lg fa-list" />
              <span>{playlist.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

export { PlaylistBar };
