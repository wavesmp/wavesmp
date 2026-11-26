import { memo, useState } from "react";
import { useNavigate } from "react-router";

import { NOW_PLAYING_NAME, routes } from "src/constants";
import { isPlaylistNameValid } from "src/playlistName";
import { useActions, usePlaylists } from "src/providers/hooks";

import { ModalInput } from "./util";

const TITLE = "Playlist Settings";
const ACTION = "Save";

const PlaylistSettings = memo(function PlaylistSettings({ playlistName }) {
  const navigate = useNavigate();
  const actions = useActions();
  const playlists = usePlaylists();
  const [playlistSaveName, setPlaylistSaveName] = useState("");

  function onChange(ev) {
    setPlaylistSaveName(ev.currentTarget.value);
  }

  async function onAction() {
    if (!isPlaylistNameValid(playlistSaveName)) {
      actions.toastErr("Invalid playlist name");
      return false;
    }
    try {
      await actions.playlistMove(playlistName, playlistSaveName);
    } catch (err) {
      actions.toastErr(`${err}`);
      return false;
    }
    const { search } = playlists[playlistName];
    const to = { pathname: `/playlist/${playlistSaveName}`, search };
    navigate(to);
    actions.toastSuccess("Renamed playlist");
    return true;
  }

  async function onDelete() {
    try {
      await actions.playlistDelete(playlistName);
    } catch (err) {
      actions.toastErr(`${err}`);
      return false;
    }
    const { search } = playlists[NOW_PLAYING_NAME];
    const to = { pathname: routes.defaultRoute, search };
    navigate(to);
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
