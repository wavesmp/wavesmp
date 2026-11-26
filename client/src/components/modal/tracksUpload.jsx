import { memo, useState } from "react";
import { useLocation } from "react-router";

import { UPLOADS_NAME as playlistName } from "src/constants";
import { useActions, useSelectorState } from "src/providers/hooks";
import { getOrCreatePlaylistSelectors } from "src/selectors";

import { uploadColumns } from "../table/columns";
import { Modal } from "./util";

const TracksUpload = memo(function TracksUpload() {
  const location = useLocation();
  const actions = useActions();
  const selectorState = useSelectorState();
  const props = selectStateProps(selectorState, { location });
  const [uploading, setUploading] = useState(false);

  async function onUpload() {
    setUploading(true);
    const { uploadErrs, serverErr } = await actions.tracksUpload();
    setUploading(false);
    return uploadErrs.length === 0 && !serverErr;
  }

  function renderUploadItems() {
    const { displayItems, columns, index, isPlaying } = props;
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

  const { displayItems } = props;
  const plurality = displayItems.length ? "s" : "";
  const message = `This will upload the track${plurality} below.`;
  return (
    <Modal
      actions={actions}
      title={`Upload track${plurality}`}
      actionTitle={uploading ? "Uploading" : "Upload"}
      disabled={uploading}
      onAction={onUpload}
    >
      <div>
        <span>{message}</span>
      </div>
      {renderUploadItems()}
    </Modal>
  );
});

function selectStateProps(state, route) {
  const { getPlaylistProps } = getOrCreatePlaylistSelectors(
    playlistName,
    URLSearchParams,
    playlistName,
  );

  const { account, tracks } = state;
  const { playing } = tracks;
  const { isPlaying } = playing;
  const { location } = route;
  const { search } = location;
  const columns = uploadColumns.filter((c) => account.columns.has(c.title));
  return {
    isPlaying,
    columns,
    ...getPlaylistProps(state, search),
  };
}

export { TracksUpload };
