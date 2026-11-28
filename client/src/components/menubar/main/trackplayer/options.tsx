import type { JSX, MouseEvent } from "react";
import { memo } from "react";

import { menuTypes } from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";
import type { Selection } from "src/types/playlistTypes";
import type { MenuProps } from "src/types/stateTypes";

interface TrackInfoProps {
  filteredSelection: Selection;
}

const TrackInfo = memo(function TrackInfo(props: TrackInfoProps): JSX.Element {
  const { filteredSelection } = props;
  return (
    <div className="trackplayer-info-title">
      {filteredSelection.size} Selected
    </div>
  );
});

interface LeftButtonsProps {
  actions: BoundActions;
}

const LeftButtons = memo(function LeftButtons(
  props: LeftButtonsProps,
): JSX.Element {
  const onBack = (): void => {
    const { actions } = props;
    actions.menubarSet(false);
  };

  return (
    <div className="trackplayer-left">
      <i className="fa fa-lg fa-arrow-left trackplayer-btn" onClick={onBack} />
    </div>
  );
});

interface RightButtonsProps {
  actions: BoundActions;
  filteredSelection: Selection;
  index: number | null;
  playlistName: string | null;
}

const RightButtons = memo(function RightButtons({
  actions,
  filteredSelection,
  index,
  playlistName,
}: RightButtonsProps): JSX.Element {
  const onOptionsClick = (ev: MouseEvent<HTMLElement>): void => {
    const first = filteredSelection.entries().next();
    if (first.done) {
      actions.toastErr("No selection found");
      return;
    }

    const menuProps: MenuProps = {
      index,
      playlistName: playlistName ?? undefined,
    };
    if (filteredSelection.size === 1) {
      [menuProps.itemIndex, menuProps.trackId] = first.value;
    } else {
      menuProps.bulk = true;
    }
    actions.menuSetElem({
      ev,
      type: menuTypes.TRACK,
      props: menuProps,
    });
  };

  return (
    <div className="trackplayer-right">
      <i
        className="fa fa-lg fa-ellipsis-v trackplayer-btn"
        onClick={onOptionsClick}
      />
    </div>
  );
});

const Options = memo(function Options(props: RightButtonsProps): JSX.Element {
  const { actions, filteredSelection, index, playlistName } = props;
  return (
    <div className="trackplayer">
      <LeftButtons actions={actions} />
      <TrackInfo filteredSelection={filteredSelection} />
      <RightButtons
        actions={actions}
        filteredSelection={filteredSelection}
        index={index}
        playlistName={playlistName}
      />
    </div>
  );
});

export { Options };
