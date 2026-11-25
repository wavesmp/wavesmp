import { memo, useState } from "react";

import { useActions, useWavesSelector } from "src/providers/hooks";
import { getFilteredSelection } from "src/selectors";

import { ModalInput } from "./util";

const PlaylistCreate = memo(function PlaylistCreate({ playlistSrc }) {
  const actions = useActions();
  const numItems = useWavesSelector((state) =>
    playlistSrc ? getFilteredSelection(state, playlistSrc).size : undefined,
  );
  const [name, setName] = useState("");

  function onChange(ev) {
    setName(ev.currentTarget.value);
  }

  async function onAction() {
    if (numItems) {
      actions.playlistAdd(playlistSrc, name);
      return true;
    }
    try {
      await actions.playlistCreate(name);
    } catch (err) {
      actions.toastErr(`${err}`);
      console.log(`Error creating playlist: ${err}`);
      return false;
    }
    actions.toastSuccess("Created playlist");
    return true;
  }

  let title = "Create Playlist";
  if (numItems) {
    const plurality = numItems === 1 ? "" : "s";
    title = `Create Playlist with ${numItems} track${plurality}`;
  }

  return (
    <ModalInput
      actions={actions}
      title={title}
      actionTitle="Create"
      onAction={onAction}
      label="Name"
      value={name}
      onChange={onChange}
    />
  );
});

export { PlaylistCreate };
