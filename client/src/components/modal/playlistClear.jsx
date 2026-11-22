import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as WavesActions from "src/actions";
import { NOW_PLAYING_NAME } from "src/constants";

import { Modal } from "./util";

const TITLE = "Clear Playlist";
const DELETE_TITLE = "Clear";
const MESSAGE = "This will clear the Now Playing playlist. Are you sure?";

class ClearPlaylistModal extends React.PureComponent {
  onDelete = async () => {
    const { actions } = this.props;
    try {
      await actions.playlistDelete(NOW_PLAYING_NAME);
    } catch (err) {
      actions.toastErr(`${err}`);
      return false;
    }
    return true;
  };

  render() {
    const { actions } = this.props;
    return (
      <Modal
        actions={actions}
        title={TITLE}
        deleteTitle={DELETE_TITLE}
        onDelete={this.onDelete}
      >
        <div>
          <span>{MESSAGE}</span>
        </div>
      </Modal>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch),
  };
}

const PlaylistClear = connect(
  undefined,
  mapDispatchToProps,
)(ClearPlaylistModal);

export { PlaylistClear };
