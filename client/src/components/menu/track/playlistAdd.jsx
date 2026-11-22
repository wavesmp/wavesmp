import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as WavesActions from "src/actions";

import { isInternalPlaylist } from "src/playlistName";
import { Back, PlaylistAddItem } from "./items";

class PlaylistAddComponent extends React.PureComponent {
  onBackClick = () => {
    const { actions } = this.props;
    actions.menuBack();
  };

  onPlaylistAdd = (playlist) => {
    const { actions, currentPlaylist } = this.props;
    actions.playlistAdd(currentPlaylist, playlist);
    actions.menuReset();
  };

  getPlaylistAddItems() {
    const { playlists } = this.props;
    const items = [];

    for (const playlist in playlists) {
      if (!isInternalPlaylist(playlist)) {
        items.push(
          <PlaylistAddItem
            key={playlist}
            name={playlist}
            onPlaylistAdd={this.onPlaylistAdd}
          />,
        );
      }
    }

    return items;
  }

  render() {
    return (
      <div className="menu-track">
        <Back onClick={this.onBackClick} />
        {this.getPlaylistAddItems()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    playlists: state.tracks.playlists,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch),
  };
}

const PlaylistAdd = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PlaylistAddComponent);

export { PlaylistAdd };
