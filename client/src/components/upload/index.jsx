import { memo, useCallback, useEffect, useRef, useState } from "react";

import { modalTypes, UPLOADS_NAME as playlistName } from "src/constants";
import { useActions, useWavesSelector } from "src/providers/hooks";
import { getOrCreatePlaylistSelectors } from "src/selectors";

import { ContentPage } from "../contentpage";
import { Table } from "../table";
import { uploadColumns } from "../table/columns";
import { processTrack } from "./processTrack";

// import defaultTrackLogoUrl from './default-track-image.png'

import "./index.css";

const ACCEPTED_FILE_TYPES = "audio/mp3,audio/mpeg";
const ACCEPTED_FILE_TYPE_LIST = ["audio/mp3", "audio/mpeg"];

const Upload = memo(function Upload(ownProps) {
  const actions = useActions();
  const props = useWavesSelector((state) => selectStateProps(state, ownProps));
  const {
    columns,
    currentPage,
    displayItems,
    index,
    isPlaying,
    lastPage,
    layout,
    loaded,
    numItems,
    pathname,
    qp,
    rowsPerPage,
    selection,
  } = props;
  const [dragging, setDragging] = useState(false);
  /* Never set. The upload modal tracks upload progress instead */
  const uploading = false;

  /* processFiles reads these after awaiting, so use the latest values */
  const latest = useRef({ numItems, rowsPerPage });
  useEffect(() => {
    latest.current = { numItems, rowsPerPage };
  });

  function onUpload() {
    actions.modalSet({ type: modalTypes.TRACKS_UPLOAD });
  }

  function onDragEnter(ev) {
    setDragging(true);
    ev.preventDefault();
  }

  function onDragLeave() {
    setDragging(false);
  }

  // Needed preventDefault on dragenter, dragover, and ondrop events
  // https://stackoverflow.com/questions/8414154/
  // html5-drop-event-doesnt-work-unless-dragover-is-handled
  function onDragOver(ev) {
    ev.preventDefault();
  }

  function validateDropFileType(f) {
    if (ACCEPTED_FILE_TYPE_LIST.indexOf(f.type) > -1) {
      return true;
    }
    actions.toastErr(`${f.name}: Invalid file type`);
    return false;
  }

  /* Wrap the processTrack call, and handle errors */
  async function wrapProcessTrack(file) {
    try {
      return processTrack(file);
    } catch (err) {
      actions.toastErr(`${file.name}: Failed to read track info: ${err}`);
      console.log(err);
      console.log(err.stack);
    }
    return null;
  }

  async function processFiles(files) {
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const newUploads = await Promise.all(Array.from(files, wrapProcessTrack));
    const validNewUploads = newUploads.filter((upload) => upload != null);

    const { numItems: currentNumItems, rowsPerPage: maxItems } = latest.current;
    if (currentNumItems + validNewUploads.length > maxItems) {
      /* TODO look into command line utility */
      actions.toastErr(`Cannot upload more than ${maxItems} items`);
      return;
    }
    actions.tracksAdd(validNewUploads, playlistName);
  }

  function onDrop(ev) {
    ev.preventDefault();
    setDragging(false);
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const files = Array.from(ev.dataTransfer.files).filter(
      validateDropFileType,
    );

    if (files.length === 0) {
      return;
    }
    processFiles(files);
  }

  function onFileSelect(ev) {
    /* Files should only be valid types due to the input accept clause */
    processFiles(ev.currentTarget.files);
  }

  /* Stable, since it is passed down to every table cell */
  const onItemEdit = useCallback(
    (id, key, value) => {
      actions.tracksLocalInfoUpdate(id, key, value, playlistName);
    },
    [actions],
  );

  let uploads = null;
  if (loaded && numItems !== 0) {
    uploads = (
      <Table
        actions={actions}
        columns={columns}
        currentPage={currentPage}
        lastPage={lastPage}
        draggable={false}
        orderable={false}
        isPlaying={isPlaying}
        pathname={pathname}
        qp={qp}
        displayItems={displayItems}
        numItems={numItems}
        onItemEdit={onItemEdit}
        index={index}
        layout={layout}
        selection={selection}
        playlistName={playlistName}
      />
    );
  }

  let dropZoneClass = "upload-drop-zone";
  if (dragging) {
    dropZoneClass += " upload-drop-zone-dragging";
  }

  // TODO add progress bar?
  return (
    <ContentPage title="Upload Files">
      <div>
        <h4>Select files from your device</h4>
        <form>
          <div>
            <input
              type="file"
              className="upload-file-input"
              name="uploads[]"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              onChange={onFileSelect}
            />
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={uploads == null || uploading}
              onClick={onUpload}
            >
              {uploading ? "Uploading" : "Upload files"}
            </button>
          </div>
        </form>

        <h4>Or drag and drop files below</h4>
        <div
          className={dropZoneClass}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          Just drag and drop files here
        </div>
        {uploads}
      </div>
    </ContentPage>
  );
});

function selectStateProps(state, ownProps) {
  const { getRouterQueryParams, getPlaylistProps } =
    getOrCreatePlaylistSelectors(playlistName, URLSearchParams, playlistName);
  const { account, layout, tracks } = state;
  const { playing } = tracks;
  const { isPlaying } = playing;
  const { location } = ownProps;
  const { pathname, search } = location;
  const columns = uploadColumns.filter((c) => account.columns.has(c.title));
  return {
    rowsPerPage: account.rowsPerPage,
    pathname,
    qp: getRouterQueryParams(undefined, search),
    isPlaying,
    columns,
    layout,
    ...getPlaylistProps(state, search),
  };
}

export { Upload };
