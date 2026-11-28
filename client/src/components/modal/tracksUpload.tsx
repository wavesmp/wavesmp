import type { JSX } from "react";
import { memo, useState } from "react";
import { useLocation } from "react-router";

import { UPLOADS_NAME as playlistName } from "src/constants";
import { useActions, useSelectorState } from "src/providers/hooks";
import { getOrCreatePlaylistSelectors } from "src/selectors";
import type { NormalizedTrack } from "src/types/trackTypes";

import { uploadColumns } from "../table/columns";
import type { Column } from "../table/tableTypes";
import { Modal } from "./util";

const TracksUpload = memo(function TracksUpload(): JSX.Element {
  const location = useLocation();
  const actions = useActions();
  const selectorState = useSelectorState();
  const stateProps = selectStateProps(selectorState, location.search);
  const [uploading, setUploading] = useState(false);

  async function onUpload(): Promise<boolean> {
    setUploading(true);
    const { uploadErrs, serverErr } = await actions.tracksUpload();
    setUploading(false);
    return uploadErrs.length === 0 && !serverErr;
  }

  function renderUploadItems(): JSX.Element {
    const { displayItems, columns, index, isPlaying } = stateProps;
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

  const { displayItems } = stateProps;
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

interface TracksUploadStateProps {
  isPlaying: boolean;
  columns: Column[];
  index: number | null;
  displayItems: NormalizedTrack[];
}

function selectStateProps(
  state: ReturnType<typeof useSelectorState>,
  search: string,
): TracksUploadStateProps {
  const { getPlaylistProps } = getOrCreatePlaylistSelectors(
    playlistName,
    URLSearchParams,
    playlistName,
  );

  const { account, tracks } = state;
  const { playing } = tracks;
  const { isPlaying } = playing;
  const columns = uploadColumns.filter((c) => account.columns?.has(c.title));
  const playlistProps = getPlaylistProps(state, search);
  return {
    isPlaying,
    columns,
    index: playlistProps.loaded ? playlistProps.index : null,
    displayItems: playlistProps.loaded ? playlistProps.displayItems : [],
  };
}

export { TracksUpload };
