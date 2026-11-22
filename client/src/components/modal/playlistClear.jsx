import { memo } from "react";

import { NOW_PLAYING_NAME } from "src/constants";
import { useActions } from "src/providers/hooks";

import { Modal } from "./util";

const TITLE = "Clear Playlist";
const DELETE_TITLE = "Clear";
const MESSAGE = "This will clear the Now Playing playlist. Are you sure?";

const PlaylistClear = memo(function PlaylistClear(ownProps) {
  const actions = useActions();
  const props = { ...ownProps, actions };

  const onDelete = async () => {
    const { actions } = props;
    try {
      await actions.playlistDelete(NOW_PLAYING_NAME);
    } catch (err) {
      actions.toastErr(`${err}`);
      return false;
    }
    return true;
  };

  return (
    <Modal
      actions={actions}
      title={TITLE}
      deleteTitle={DELETE_TITLE}
      onDelete={onDelete}
    >
      <div>
        <span>{MESSAGE}</span>
      </div>
    </Modal>
  );
});

export { PlaylistClear };
