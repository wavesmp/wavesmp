import { memo } from "react";

import { isInternalPlaylist } from "src/playlistName";
import { useActions, useWavesSelector } from "src/providers/hooks";
import { Back, PlaylistAddItem } from "./items";

const PlaylistAdd = memo(function PlaylistAdd(ownProps) {
  const actions = useActions();
  const stateProps = useWavesSelector((state) =>
    selectStateProps(state, ownProps),
  );
  const props = { ...ownProps, ...stateProps, actions };

  const onBackClick = () => {
    const { actions } = props;
    actions.menuBack();
  };

  const onPlaylistAdd = (playlist) => {
    const { actions, currentPlaylist } = props;
    actions.playlistAdd(currentPlaylist, playlist);
    actions.menuReset();
  };

  function getPlaylistAddItems() {
    const { playlists } = props;
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

function selectStateProps(state) {
  return {
    playlists: state.tracks.playlists,
  };
}

export { PlaylistAdd };
