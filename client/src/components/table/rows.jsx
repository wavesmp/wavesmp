import React from "react";

import { InputCell } from "./inputcell";

const PLAY_ICON = <i className="fa fa-lg fa-play table-play-icon" />;
const PAUSE_ICON = <i className="fa fa-lg fa-pause table-pause-icon" />;
const PLAY_PAUSE_PADDING = <span className="table-blank-icon" />;

class Name extends React.PureComponent {
  emitChange = (update) => {
    const { onChange, sample } = this.props;
    onChange(sample.id, "title", update);
  };

  render() {
    const { sample, index, isPlaying, editable, title, onBlur } = this.props;

    let playPauseIcon;
    let playPausePadding;
    if (index === sample.index) {
      playPausePadding = null;
      playPauseIcon = isPlaying ? PLAY_ICON : PAUSE_ICON;
    } else {
      playPauseIcon = null;
      playPausePadding = PLAY_PAUSE_PADDING;
    }
    return (
      <td>
        {playPauseIcon}
        <InputCell
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          value={sample.title}
          title={title}
        />
        {playPausePadding}
      </td>
    );
  }
}

class State extends React.PureComponent {
  renderIcon(iconClasses) {
    return <i className={`fa fa-lg ${iconClasses}`} />;
  }

  renderRow() {
    const { sample } = this.props;
    const { state } = sample;
    switch (state) {
      case "preview":
        return this.renderIcon("fa-eye");
      case "pending":
        return this.renderIcon("fa-spinner fa-pulse");
      case "uploading":
        return <>{`${sample.uploadProgress}%`}</>;
      default:
        return this.renderIcon("fa-check-circle common-table-status-ok");
    }
  }

  render() {
    return (
      <td className="common-columns-small-screen-hide">{this.renderRow()}</td>
    );
  }
}

class Time extends React.PureComponent {
  render() {
    const { sample } = this.props;
    return <td className="common-columns-small-screen-hide">{sample.time}</td>;
  }
}

class Artist extends React.PureComponent {
  emitChange = (update) => {
    const { onChange, sample } = this.props;
    onChange(sample.id, "artist", update);
  };

  render() {
    const { sample, editable, title, onBlur } = this.props;
    return (
      <td>
        <InputCell
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          value={sample.artist}
          title={title}
        />
      </td>
    );
  }
}

class Album extends React.PureComponent {
  emitChange = (update) => {
    const { onChange, sample } = this.props;
    onChange(sample.id, "album", update);
  };

  render() {
    const { sample, editable, title, onBlur } = this.props;
    return (
      <td>
        <InputCell
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          value={sample.album}
          title={title}
        />
      </td>
    );
  }
}

class Genre extends React.PureComponent {
  emitChange = (update) => {
    const { onChange, sample } = this.props;
    onChange(sample.id, "genre", update);
  };

  render() {
    const { sample, editable, title, onBlur } = this.props;
    return (
      <td>
        <InputCell
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          value={sample.genre}
          title={title}
        />
      </td>
    );
  }
}

class CreatedAt extends React.PureComponent {
  render() {
    const { sample } = this.props;
    return (
      <td className="common-columns-small-screen-hide">
        {sample.createdAtPretty}
      </td>
    );
  }
}

export { Album, Artist, CreatedAt, Genre, Name, State, Time };
