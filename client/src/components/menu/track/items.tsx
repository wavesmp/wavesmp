import type { JSX } from "react";
import { memo } from "react";

interface ItemProps {
  onClick: () => void;
}

function LibraryDelete({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-trash-o menu-track-delete" />
      &nbsp;&nbsp;Delete
    </li>
  );
}

function PlaylistRemove({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-times menu-track-remove" />
      &nbsp;&nbsp;Remove
    </li>
  );
}

function Download({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-download menu-track-download" />
      &nbsp;&nbsp;Download
    </li>
  );
}

function PlaylistAdd({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-plus-circle menu-track-add" />
      &nbsp;&nbsp;Add to Playlist...
    </li>
  );
}

function Back({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-chevron-circle-left menu-track-back" />
      &nbsp;&nbsp;Back
    </li>
  );
}

function NowPlayingAdd({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-plus menu-track-add" />
      &nbsp;&nbsp;Add to Now Playing
    </li>
  );
}

function Play({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-play menu-track-play" />
      &nbsp;&nbsp;Play
    </li>
  );
}

function Pause({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-pause menu-track-pause" />
      &nbsp;&nbsp;Pause
    </li>
  );
}

function PlayResume({ onClick }: ItemProps): JSX.Element {
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-play-circle menu-track-play" />
      &nbsp;&nbsp;Resume
    </li>
  );
}

interface PlaylistAddItemProps {
  name: string;
  onPlaylistAdd: (name: string) => void;
}

const PlaylistAddItem = memo(function PlaylistAddItem(
  props: PlaylistAddItemProps,
): JSX.Element {
  const onClick = (): void => {
    const { name, onPlaylistAdd } = props;
    onPlaylistAdd(name);
  };

  const { name } = props;
  return (
    <li className="btn btn-default menu-track-item" onClick={onClick}>
      <i className="fa fa-lg fa-list" />
      &nbsp;&nbsp;{name}
    </li>
  );
});

export {
  Back,
  Download,
  LibraryDelete,
  NowPlayingAdd,
  Pause,
  Play,
  PlaylistAdd,
  PlaylistAddItem,
  PlaylistRemove,
  PlayResume,
};
