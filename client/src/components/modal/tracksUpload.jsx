import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as WavesActions from "src/actions";
import { UPLOADS_NAME as playlistName } from "src/constants";
import { getOrCreatePlaylistSelectors } from "src/selectors";

import { uploadColumns } from "../table/columns";
import { Modal } from "./util";

class TracksUploadModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { uploading: false };
  }

  onUpload = async () => {
    const { actions } = this.props;
    this.setState({ uploading: true });
    const { uploadErrs, serverErr } = await actions.tracksUpload();
    this.setState({ uploading: false });
    return uploadErrs.length === 0 && !serverErr;
  };

  renderUploadItems() {
    const { displayItems, columns, index, isPlaying } = this.props;
    return (
      <div>
        <div>
          <table className="table modal-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.title}>{column.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayItems.map((sample) => (
                <tr key={sample.id}>
                  {columns.map((column) => (
                    <column.Component
                      key={column.title}
                      isPlaying={isPlaying}
                      index={index}
                      sample={sample}
                      editable={false}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const { uploading } = this.state;
    const { actions, displayItems } = this.props;
    const plurality = displayItems.length ? "s" : "";
    const message = `This will upload the track${plurality} below.`;
    return (
      <Modal
        actions={actions}
        title={`Upload track${plurality}`}
        actionTitle={uploading ? "Uploading" : "Upload"}
        disabled={uploading}
        onAction={this.onUpload}
      >
        <div>
          <span>{message}</span>
        </div>
        {this.renderUploadItems()}
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { getPlaylistProps } = getOrCreatePlaylistSelectors(
    playlistName,
    URLSearchParams,
    playlistName,
  );

  const { account, tracks } = state;
  const { playing } = tracks;
  const { isPlaying } = playing;
  const { location } = ownProps;
  const { search } = location;
  const columns = uploadColumns.filter((c) => account.columns.has(c.title));
  return {
    isPlaying,
    columns,
    ...getPlaylistProps(state, search),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch),
  };
}

const TracksUpload = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TracksUploadModal);

export { TracksUpload };
