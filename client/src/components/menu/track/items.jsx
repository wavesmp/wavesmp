import React from "react";

function LibraryDelete({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-trash-o menu-track-delete" />
      &nbsp;&nbsp;Delete
    </li>
  );
}

function PlaylistRemove({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-times menu-track-remove" />
      &nbsp;&nbsp;Remove
    </li>
  );
}

function Download({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-download menu-track-download" />
      &nbsp;&nbsp;Download
    </li>
  );
}

function PlaylistAdd({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-plus-circle menu-track-add" />
      &nbsp;&nbsp;Add to Playlist...
    </li>
  );
}

function Back({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-chevron-circle-left menu-track-back" />
      &nbsp;&nbsp;Back
    </li>
  );
}

function NowPlayingAdd({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-plus menu-track-add" />
      &nbsp;&nbsp;Add to Now Playing
    </li>
  );
}

function Play({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-play menu-track-play" />
      &nbsp;&nbsp;Play
    </li>
  );
}

function Pause({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-pause menu-track-pause" />
      &nbsp;&nbsp;Pause
    </li>
  );
}

function PlayResume({ onClick }) {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-play-circle menu-track-play" />
      &nbsp;&nbsp;Resume
    </li>
  );
}

class PlaylistAddItem extends React.PureComponent {
  onClick = () => {
    const { name, onPlaylistAdd } = this.props;
    onPlaylistAdd(name);
  };

  render() {
    const { name } = this.props;
    return (
      <li className="btn btn-default menu-track-item" onClick={this.onClick}>
        <i className="fa fa-lg fa-list" />
        &nbsp;&nbsp;{name}
      </li>
    );
  }
}

export {
  Back,
  Download,
  LibraryDelete,
  NowPlayingAdd,
  Pause,
  Play,
  PlayResume,
  PlaylistAdd,
  PlaylistAddItem,
  PlaylistRemove,
};
