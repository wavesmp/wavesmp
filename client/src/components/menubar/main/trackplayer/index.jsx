import { memo } from "react";

import { Options } from "./options";
import { Player } from "./player";

import "./index.css";

const TrackPlayer = memo(function TrackPlayer({ ref, ...props }) {
  const { menubar, filteredSelection, playlistName, index, actions, playing } =
    props;
  if (menubar) {
    return (
      <Options
        ref={ref}
        actions={actions}
        filteredSelection={filteredSelection}
        playlistName={playlistName}
        index={index}
      />
    );
  }
  return <Player ref={ref} actions={actions} playing={playing} />;
});

export { TrackPlayer };
