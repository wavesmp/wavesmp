import { memo, useCallback } from "react";

import { InputCell } from "./inputcell";

const PLAY_ICON = <i className="fa fa-lg fa-play table-play-icon" />;
const PAUSE_ICON = <i className="fa fa-lg fa-pause table-pause-icon" />;
const PLAY_PAUSE_PADDING = <span className="table-blank-icon" />;

/* Calls onChange with the track id and attribute of an edited cell */
function useEmitChange(onChange, id, attribute) {
  return useCallback(
    (update) => {
      onChange(id, attribute, update);
    },
    [onChange, id, attribute],
  );
}

const Name = memo(function Name({
  sample,
  index,
  isPlaying,
  editable,
  title,
  onBlur,
  onChange,
}) {
  const emitChange = useEmitChange(onChange, sample.id, "title");

  let playPauseIcon;
  let playPausePadding;
  if (index === sample.index) {
    playPausePadding = null;
    playPauseIcon = isPlaying ? PLAY_ICON : PAUSE_ICON;
  } else {
    playPauseIcon = null;
    playPausePadding = PLAY_PAUSE_PADDING;
  }
  return (
    <td>
      {playPauseIcon}
      <InputCell
        onChange={emitChange}
        onBlur={onBlur}
        editable={editable}
        value={sample.title}
        title={title}
      />
      {playPausePadding}
    </td>
  );
});

function renderStateIcon(iconClasses) {
  return <i className={`fa fa-lg ${iconClasses}`} />;
}

const State = memo(function State({ sample }) {
  let content;
  switch (sample.state) {
    case "preview":
      content = renderStateIcon("fa-eye");
      break;
    case "pending":
      content = renderStateIcon("fa-spinner fa-pulse");
      break;
    case "uploading":
      content = <>{`${sample.uploadProgress}%`}</>;
      break;
    default:
      content = renderStateIcon("fa-check-circle common-table-status-ok");
  }
  return <td className="common-columns-small-screen-hide">{content}</td>;
});

const Time = memo(function Time({ sample }) {
  return <td className="common-columns-small-screen-hide">{sample.time}</td>;
});

const Artist = memo(function Artist({
  sample,
  editable,
  title,
  onBlur,
  onChange,
}) {
  const emitChange = useEmitChange(onChange, sample.id, "artist");
  return (
    <td>
      <InputCell
        onChange={emitChange}
        onBlur={onBlur}
        editable={editable}
        value={sample.artist}
        title={title}
      />
    </td>
  );
});

const Album = memo(function Album({
  sample,
  editable,
  title,
  onBlur,
  onChange,
}) {
  const emitChange = useEmitChange(onChange, sample.id, "album");
  return (
    <td>
      <InputCell
        onChange={emitChange}
        onBlur={onBlur}
        editable={editable}
        value={sample.album}
        title={title}
      />
    </td>
  );
});

const Genre = memo(function Genre({
  sample,
  editable,
  title,
  onBlur,
  onChange,
}) {
  const emitChange = useEmitChange(onChange, sample.id, "genre");
  return (
    <td>
      <InputCell
        onChange={emitChange}
        onBlur={onBlur}
        editable={editable}
        value={sample.genre}
        title={title}
      />
    </td>
  );
});

const CreatedAt = memo(function CreatedAt({ sample }) {
  return (
    <td className="common-columns-small-screen-hide">
      {sample.createdAtPretty}
    </td>
  );
});

export { Album, Artist, CreatedAt, Genre, Name, State, Time };
