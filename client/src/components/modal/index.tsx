import type { ComponentType, JSX } from "react";
import { memo } from "react";

import { modalTypes } from "src/constants";
import type {
  ModalProps,
  Modal as ModalState,
  ModalType,
} from "src/types/stateTypes";

import { PlaylistClear } from "./playlistClear";
import { PlaylistCreate } from "./playlistCreate";
import { PlaylistSave } from "./playlistSave";
import { PlaylistSettings } from "./playlistSettings";
import { TracksDelete } from "./tracksDelete";
import { TracksUpload } from "./tracksUpload";

import "./index.css";

const MODALS: Record<ModalType, ComponentType<ModalProps>> = {
  [modalTypes.PLAYLIST_CLEAR]: PlaylistClear,
  [modalTypes.PLAYLIST_CREATE]: PlaylistCreate,
  [modalTypes.PLAYLIST_SAVE]: PlaylistSave,
  [modalTypes.PLAYLIST_SETTINGS]: PlaylistSettings,
  [modalTypes.TRACKS_DELETE]: TracksDelete,
  [modalTypes.TRACKS_UPLOAD]: TracksUpload,
};

interface ModalComponentProps {
  modal: ModalState | null;
}

const Modal = memo(function Modal({
  modal,
}: ModalComponentProps): JSX.Element | null {
  if (!modal) {
    return null;
  }
  const { type, props: modalProps } = modal;
  const Component = MODALS[type];
  return (
    <>
      <div className="fixed-full-page modal-backdrop" />
      <Component {...modalProps} />
    </>
  );
});

export { Modal };
