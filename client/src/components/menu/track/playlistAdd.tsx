import type { JSX } from "react";
import { memo } from "react";

import { isInternalPlaylist } from "src/playlistName";
import { useActions, usePlaylists } from "src/providers/hooks";
import type { MenuProps } from "src/types/stateTypes";

import { Back, PlaylistAddItem } from "./items";

const PlaylistAdd = memo(function PlaylistAdd({
  currentPlaylist,
}: MenuProps): JSX.Element {
  const actions = useActions();
  const playlists = usePlaylists();

  const onBackClick = (): void => {
    actions.menuBack();
  };

  const onPlaylistAdd = (playlist: string): void => {
    if (currentPlaylist === undefined) {
      throw new Error("No playlist to add tracks from");
    }
    actions.playlistAdd(currentPlaylist, playlist);
    actions.menuReset();
  };

  function getPlaylistAddItems(): JSX.Element[] {
    const items = [];

    for (const playlist in playlists) {
      if (!isInternalPlaylist(playlist)) {
        items.push(
          <PlaylistAddItem
            key={playlist}
            name={playlist}
            onPlaylistAdd={onPlaylistAdd}
          />,
        );
      }
    }

    return items;
  }

  return (
    <div className="menu-track">
      <Back onClick={onBackClick} />
      {getPlaylistAddItems()}
    </div>
  );
});

export { PlaylistAdd };
