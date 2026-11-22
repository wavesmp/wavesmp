import { memo } from "react";

import { modalTypes } from "src/constants";

import { PlaylistClear } from "./playlistClear";
import { PlaylistCreate } from "./playlistCreate";
import { PlaylistSave } from "./playlistSave";
import { PlaylistSettings } from "./playlistSettings";
import { TracksDelete } from "./tracksDelete";
import { TracksUpload } from "./tracksUpload";

import "./index.css";

const MODALS = {
  null: null,
  [modalTypes.PLAYLIST_CLEAR]: PlaylistClear,
  [modalTypes.PLAYLIST_CREATE]: PlaylistCreate,
  [modalTypes.PLAYLIST_SAVE]: PlaylistSave,
  [modalTypes.PLAYLIST_SETTINGS]: PlaylistSettings,
  [modalTypes.TRACKS_DELETE]: TracksDelete,
  [modalTypes.TRACKS_UPLOAD]: TracksUpload,
};

const Modal = memo(function Modal({ history, location, modal }) {
  if (!modal) {
    return null;
  }
  const { type, props: modalProps } = modal;
  const Component = MODALS[type];
  return (
    <>
      <div className="fixed-full-page modal-backdrop" />
      <Component history={history} location={location} {...modalProps} />
    </>
  );
});

export { Modal };
