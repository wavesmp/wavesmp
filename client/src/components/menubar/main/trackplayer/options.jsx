import { memo } from "react";

import { menuTypes } from "src/constants";

const TrackInfo = memo(function TrackInfo(props) {
  const { filteredSelection } = props;
  return (
    <div className="trackplayer-info-title">
      {filteredSelection.size} Selected
    </div>
  );
});

const LeftButtons = memo(function LeftButtons(props) {
  const onBack = () => {
    const { actions } = props;
    actions.menubarSet(false);
  };

  return (
    <div className="trackplayer-left">
      <i className="fa fa-lg fa-arrow-left trackplayer-btn" onClick={onBack} />
    </div>
  );
});

const RightButtons = memo(function RightButtons({
  actions,
  filteredSelection,
  index,
  playlistName,
}) {
  const onOptionsClick = (ev) => {
    if (!filteredSelection || filteredSelection.size === 0) {
      actions.toastErr("No selection found");
      return;
    }

    const menuProps = { index, playlistName };
    if (filteredSelection.size === 1) {
      const { value } = filteredSelection.entries().next();
      [menuProps.itemIndex, menuProps.trackId] = value;
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

const Options = memo(function Options({ ref, ...props }) {
  const { actions, filteredSelection, index, playlistName } = props;
  return (
    <div className="trackplayer" ref={ref}>
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
