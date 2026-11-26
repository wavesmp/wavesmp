import type { JSX, Ref } from "react";
import { memo } from "react";

import type { BoundActions } from "src/providers/dispatcher";
import type { Selection } from "src/types/playlistTypes";
import type { Playing } from "src/types/stateTypes";

import { Options } from "./options";
import { Player } from "./player";

import "./index.css";

interface TrackPlayerProps {
  ref?: Ref<HTMLDivElement>;
  menubar: boolean;
  filteredSelection: Selection;
  playlistName: string | null;
  index: number | null;
  actions: BoundActions;
  playing: Playing;
}

const TrackPlayer = memo(function TrackPlayer({
  ref,
  ...props
}: TrackPlayerProps): JSX.Element {
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
