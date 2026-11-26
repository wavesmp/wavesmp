import type { ChangeEvent, JSX } from "react";
import { memo, useState } from "react";
import { useNavigate } from "react-router";

import { NOW_PLAYING_NAME, routes } from "src/constants";
import { isPlaylistNameValid } from "src/playlistName";
import { useActions, usePlaylists } from "src/providers/hooks";
import type { ModalProps } from "src/types/stateTypes";

import { ModalInput } from "./util";

const TITLE = "Playlist Settings";
const ACTION = "Save";

const PlaylistSettings = memo(function PlaylistSettings({
  playlistName,
}: ModalProps): JSX.Element {
  const navigate = useNavigate();
  const actions = useActions();
  const playlists = usePlaylists();
  const [playlistSaveName, setPlaylistSaveName] = useState("");

  function onChange(ev: ChangeEvent<HTMLInputElement>): void {
    setPlaylistSaveName(ev.currentTarget.value);
  }

  function getPlaylistName(): string {
    if (playlistName === undefined) {
      throw new Error("Playlist settings without a playlist");
    }
    return playlistName;
  }

  async function onAction(): Promise<boolean> {
    if (!isPlaylistNameValid(playlistSaveName)) {
      actions.toastErr("Invalid playlist name");
      return false;
    }
    const name = getPlaylistName();
    try {
      await actions.playlistMove(name, playlistSaveName);
    } catch (err) {
      actions.toastErr(String(err));
      return false;
    }
    const search = playlists?.[name]?.search ?? "";
    const to = { pathname: `/playlist/${playlistSaveName}`, search };
    await navigate(to);
    actions.toastSuccess("Renamed playlist");
    return true;
  }

  async function onDelete(): Promise<boolean> {
    try {
      await actions.playlistDelete(getPlaylistName());
    } catch (err) {
      actions.toastErr(String(err));
      return false;
    }
    const search = playlists?.[NOW_PLAYING_NAME]?.search ?? "";
    const to = { pathname: routes.defaultRoute, search };
    await navigate(to);
    actions.toastSuccess("Deleted playlist");
    return true;
  }

  return (
    <ModalInput
      actions={actions}
      title={TITLE}
      actionTitle={ACTION}
      onAction={onAction}
      deleteTitle="Delete"
      onDelete={onDelete}
      label="Name"
      value={playlistSaveName}
      placeholder={playlistName}
      onChange={onChange}
    />
  );
});

export { PlaylistSettings };
