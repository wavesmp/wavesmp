import { memo } from "react";

import { Options } from "./options";
import { Player } from "./player";

import "./index.css";

const TrackPlayer = memo(function TrackPlayer(props) {
  const { menubar, filteredSelection, playlistName, index, actions, playing } =
    props;
  if (menubar) {
    return (
      <Options
        actions={actions}
        filteredSelection={filteredSelection}
        playlistName={playlistName}
        index={index}
      />
    );
  }
  return <Player actions={actions} playing={playing} />;
});

export { TrackPlayer };
