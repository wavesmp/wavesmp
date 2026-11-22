import { memo } from "react";
import { Link } from "react-router-dom";

import * as constants from "src/constants";

const PlaylistBar = memo(function PlaylistBar(props) {
  const onBackClick = () => {
    const { actions } = props;
    actions.sidebarSet(false);
  };

  function onDragOver(ev) {
    if (ev.dataTransfer.types.includes(constants.PLAYLIST_TYPE)) {
      ev.preventDefault();
    }
  }

  const onNewPlaylistClick = () => {
    const { actions } = props;
    actions.modalSet({ type: constants.modalTypes.PLAYLIST_CREATE });
  };

  const onPlaylistDrop = (ev) => {
    const { actions } = props;
    const playlistSrc = ev.dataTransfer.getData(constants.PLAYLIST_TYPE);
    if (!playlistSrc) {
      return;
    }
    const playlistDst = ev.currentTarget.getAttribute(
      constants.PLAYLIST_NAME_ATTR,
    );
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
  const playlistObjs = Object.values(playlists).filter(
    (p) =>
      p.name !== constants.NOW_PLAYING_NAME &&
      p.name !== constants.LIBRARY_NAME &&
      p.name !== constants.UPLOADS_NAME,
  );
  let className = "sidebar-container-wide";
  if (isSliderVisible) {
    className += " sidebar-container-player-visible";
  }
  return (
    <div id="sidebar-container" className={className}>
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
