import type { ChangeEvent, JSX } from "react";
import { memo, useState } from "react";

import { useActions, useSelectorState } from "src/providers/hooks";
import { getFilteredSelection } from "src/selectors";
import type { ModalProps } from "src/types/stateTypes";

import { ModalInput } from "./util";

const PlaylistCreate = memo(function PlaylistCreate({
  playlistSrc,
}: ModalProps): JSX.Element {
  const actions = useActions();
  const selectorState = useSelectorState();
  const numItems = playlistSrc
    ? getFilteredSelection(selectorState, playlistSrc).size
    : undefined;
  const [name, setName] = useState("");

  function onChange(ev: ChangeEvent<HTMLInputElement>): void {
    setName(ev.currentTarget.value);
  }

  function onAction(): boolean {
    if (playlistSrc && numItems) {
      actions.playlistAdd(playlistSrc, name);
      return true;
    }
    try {
      actions.playlistCreate(name);
    } catch (err) {
      actions.toastErr(String(err));
      console.log(`Error creating playlist: ${String(err)}`);
      return false;
    }
    actions.toastSuccess("Created playlist");
    return true;
  }

  let title = "Create Playlist";
  if (numItems) {
    const plurality = numItems === 1 ? "" : "s";
    title = `Create Playlist with ${numItems.toString()} track${plurality}`;
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
