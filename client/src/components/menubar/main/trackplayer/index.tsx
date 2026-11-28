import type { JSX } from "react";
import { memo } from "react";

import type { BoundActions } from "src/providers/dispatcher";
import type { Selection } from "src/types/playlistTypes";
import type { Playing } from "src/types/stateTypes";

import { Options } from "./options";
import { Player } from "./player";

import "./index.css";

interface TrackPlayerProps {
  menubar: boolean;
  filteredSelection: Selection;
  playlistName: string | null;
  index: number | null;
  actions: BoundActions;
  playing: Playing;
}

const TrackPlayer = memo(function TrackPlayer(
  props: TrackPlayerProps,
): JSX.Element {
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
