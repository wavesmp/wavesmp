import React from "react";
import { Link } from "react-router-dom";

import constants from "waves-client-constants";

export default class PlaylistBar extends React.PureComponent {
  onBackClick = () => {
    const { actions } = this.props;
    actions.sidebarSet(false);
  };

  onDragOver(ev) {
    if (ev.dataTransfer.types.includes(constants.PLAYLIST_TYPE)) {
      ev.preventDefault();
    }
  }

  onNewPlaylistClick = () => {
    const { actions } = this.props;
    actions.modalSet({ type: constants.modalTypes.PLAYLIST_CREATE });
  };

  onPlaylistDrop = (ev) => {
    const { actions } = this.props;
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

  render() {
    const { playlists, isSliderVisible } = this.props;
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
            <span onClick={this.onBackClick}>
              <i className="fa-fw fa fa-lg fa-arrow-left" />
              <span className="sidebar-back-text">Back</span>
            </span>
          </li>
          <li className="sidebar-playlist">
            <span
              onClick={this.onNewPlaylistClick}
              onDragOver={this.onDragOver}
              onDrop={this.onPlaylistDrop}
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
                onDragOver={this.onDragOver}
                onDrop={this.onPlaylistDrop}
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
  }
}
