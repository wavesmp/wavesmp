import type { ChangeEvent, JSX } from "react";
import { memo, useState } from "react";

import { NOW_PLAYING_NAME } from "src/constants";
import { isPlaylistNameValid } from "src/playlistName";
import { useActions } from "src/providers/hooks";

import { ModalInput } from "./util";

const TITLE = "Save Playlist";
const ACTION = "Save";

const PlaylistSave = memo(function PlaylistSave(): JSX.Element {
  const actions = useActions();
  const [playlistSaveName, setPlaylistSaveName] = useState("");

  function onChange(ev: ChangeEvent<HTMLInputElement>): void {
    setPlaylistSaveName(ev.currentTarget.value);
  }

  async function onAction(): Promise<boolean> {
    if (!isPlaylistNameValid(playlistSaveName)) {
      actions.toastErr("Invalid playlist name");
      return false;
    }
    try {
      await actions.playlistCopy(NOW_PLAYING_NAME, playlistSaveName);
    } catch (err) {
      actions.toastErr(String(err));
      return false;
    }
    actions.toastSuccess("Saved playlist");
    return true;
  }

  return (
    <ModalInput
      actions={actions}
      title={TITLE}
      actionTitle={ACTION}
      onAction={onAction}
      label="Name"
      value={playlistSaveName}
      onChange={onChange}
    />
  );
});

export { PlaylistSave };
