import type { ChangeEvent, DragEvent, JSX } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { modalTypes, UPLOADS_NAME as playlistName } from "src/constants";
import { useActions, useLayout, useSelectorState } from "src/providers/hooks";
import type { PlaylistProps } from "src/selectors";
import { getOrCreatePlaylistSelectors } from "src/selectors";
import type { Track } from "src/types/trackTypes";

import { ContentPage } from "../contentpage";
import { Table } from "../table";
import { uploadColumns } from "../table/columns";
import type { Column, OnItemEdit } from "../table/tableTypes";
import { processTrack } from "./processTrack";

// import defaultTrackLogoUrl from './default-track-image.png'

import "./index.css";

const ACCEPTED_FILE_TYPES = "audio/mp3,audio/mpeg";
const ACCEPTED_FILE_TYPE_LIST = ["audio/mp3", "audio/mpeg"];

const Upload = memo(function Upload(): JSX.Element {
  const location = useLocation();
  const actions = useActions();
  const selectorState = useSelectorState();
  const layout = useLayout();
  const stateProps = selectStateProps(selectorState, location);
  const { columns, isPlaying, pathname, qp, rowsPerPage } = stateProps;
  const numItems = stateProps.loaded ? stateProps.numItems : 0;
  const [dragging, setDragging] = useState(false);

  /* processFiles reads these after awaiting, so use the latest values */
  const latest = useRef({ numItems, rowsPerPage });
  useEffect(() => {
    latest.current = { numItems, rowsPerPage };
  });

  function onUpload(): void {
    actions.modalSet({ type: modalTypes.TRACKS_UPLOAD });
  }

  function onDragEnter(ev: DragEvent): void {
    setDragging(true);
    ev.preventDefault();
  }

  function onDragLeave(): void {
    setDragging(false);
  }

  // Needed preventDefault on dragenter, dragover, and ondrop events
  // https://stackoverflow.com/questions/8414154/
  // html5-drop-event-doesnt-work-unless-dragover-is-handled
  function onDragOver(ev: DragEvent): void {
    ev.preventDefault();
  }

  function validateDropFileType(f: File): boolean {
    if (ACCEPTED_FILE_TYPE_LIST.includes(f.type)) {
      return true;
    }
    actions.toastErr(`${f.name}: Invalid file type`);
    return false;
  }

  /* Wrap the processTrack call, and handle errors */
  async function wrapProcessTrack(file: File): Promise<Track | null> {
    try {
      return await processTrack(file);
    } catch (err) {
      actions.toastErr(
        `${file.name}: Failed to read track info: ${String(err)}`,
      );
      console.log(err);
    }
    return null;
  }

  async function processFiles(files: Iterable<File>): Promise<void> {
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const newUploads = await Promise.all(Array.from(files, wrapProcessTrack));
    const validNewUploads = newUploads.filter((upload) => upload != null);

    const { numItems: currentNumItems } = latest.current;
    const maxItems = latest.current.rowsPerPage ?? 0;
    if (currentNumItems + validNewUploads.length > maxItems) {
      /* TODO look into command line utility */
      actions.toastErr(`Cannot upload more than ${maxItems.toString()} items`);
      return;
    }
    actions.tracksAdd(validNewUploads, playlistName);
  }

  function onDrop(ev: DragEvent): void {
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
    void processFiles(files);
  }

  function onFileSelect(ev: ChangeEvent<HTMLInputElement>): void {
    /* Files should only be valid types due to the input accept clause */
    const { files } = ev.currentTarget;
    if (files) {
      void processFiles(files);
    }
  }

  /* Stable, since it is passed down to every table cell */
  const onItemEdit = useCallback<OnItemEdit>(
    (id, key, value) => {
      actions.tracksLocalInfoUpdate(id, key, value, playlistName);
    },
    [actions],
  );

  let uploads = null;
  if (stateProps.loaded && numItems !== 0) {
    const { currentPage, lastPage, displayItems, index, selection } =
      stateProps;
    uploads = (
      <Table
        actions={actions}
        columns={columns}
        currentPage={currentPage}
        lastPage={lastPage}
        sortKey={stateProps.sortKey}
        ascending={stateProps.ascending}
        draggable={false}
        orderable={false}
        isPlaying={isPlaying}
        pathname={pathname}
        qp={qp}
        displayItems={displayItems}
        onItemEdit={onItemEdit}
        index={index}
        layout={layout}
        selection={selection}
        playlistName={playlistName}
        menubar={false}
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
              disabled={uploads == null}
              onClick={onUpload}
            >
              Upload files
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

type UploadStateProps = {
  rowsPerPage: number | null;
  pathname: string;
  qp: URLSearchParams;
  isPlaying: boolean;
  columns: Column[];
} & PlaylistProps;

function selectStateProps(
  state: ReturnType<typeof useSelectorState>,
  location: { pathname: string; search: string },
): UploadStateProps {
  const { getRouterQueryParams, getPlaylistProps } =
    getOrCreatePlaylistSelectors(playlistName, URLSearchParams, playlistName);
  const { account, tracks } = state;
  const { isPlaying } = tracks.playing;
  const { pathname, search } = location;
  const columns = uploadColumns.filter((c) => account.columns?.has(c.title));
  return {
    rowsPerPage: account.rowsPerPage,
    pathname,
    qp: getRouterQueryParams(undefined, search),
    isPlaying,
    columns,
    ...getPlaylistProps(state, search),
  };
}

export { Upload };
