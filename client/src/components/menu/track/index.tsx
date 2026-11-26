import type { JSX } from "react";
import { memo } from "react";

import {
  LIBRARY_NAME,
  NOW_PLAYING_NAME,
  UPLOADS_NAME,
  menuTypes,
  modalTypes,
} from "src/constants";
import { useActions, usePlaying } from "src/providers/hooks";
import type { MenuProps } from "src/types/stateTypes";

import "./index.css";

import {
  Download,
  LibraryDelete,
  NowPlayingAdd,
  Pause,
  Play,
  PlayResume,
  PlaylistAdd,
  PlaylistRemove,
} from "./items";

/* The menu for the selected tracks of a playlist */
const Track = memo(function Track(props: MenuProps): JSX.Element {
  const actions = useActions();
  const { isPlaying } = usePlaying();

  function getPlaylistName(): string {
    if (props.playlistName === undefined) {
      throw new Error("Track menu without a playlist");
    }
    return props.playlistName;
  }

  function getTrackId(): string {
    if (props.trackId === undefined) {
      throw new Error("Track menu without a track");
    }
    return props.trackId;
  }

  const trackToggle = (): void => {
    const { itemIndex } = props;
    if (itemIndex === undefined) {
      throw new Error("Track menu without an item index");
    }
    actions.trackToggle(getTrackId(), getPlaylistName(), itemIndex);
    actions.menuReset();
  };

  const pause = (): void => {
    actions.pause();
    actions.menuReset();
  };

  const play = (): void => {
    void actions.play();
    actions.menuReset();
  };

  const tracksDelete = (): void => {
    actions.modalSet({ type: modalTypes.TRACKS_DELETE });
    actions.menuReset();
  };

  const tracksRemove = async (): Promise<void> => {
    try {
      await actions.tracksRemove(getPlaylistName());
      actions.menuReset();
    } catch (err) {
      actions.toastErr(String(err));
    }
  };

  const trackUploadsDelete = (): void => {
    actions.trackUploadsDelete();
  };

  const nowPlayingAdd = (): void => {
    actions.playlistAdd(getPlaylistName(), NOW_PLAYING_NAME);
    actions.menuReset();
  };

  const playlistAdd = (): void => {
    actions.menuNext({
      type: menuTypes.PLAYLIST_ADD,
      props: { currentPlaylist: getPlaylistName() },
    });
  };

  const download = (): void => {
    void actions.download(getTrackId());
    actions.menuReset();
  };

  function getPlayOrPauseAction(): JSX.Element {
    const { index, itemIndex } = props;
    if (index === itemIndex) {
      if (isPlaying) {
        return <Pause onClick={pause} />;
      }
      return <PlayResume onClick={play} />;
    }
    return <Play onClick={trackToggle} />;
  }

  function getRemoveAction(): JSX.Element {
    const { playlistName } = props;
    if (playlistName === LIBRARY_NAME) {
      return <LibraryDelete onClick={tracksDelete} />;
    }
    if (playlistName === UPLOADS_NAME) {
      return <PlaylistRemove onClick={trackUploadsDelete} />;
    }
    return <PlaylistRemove onClick={() => void tracksRemove()} />;
  }

  const { bulk, playlistName } = props;
  return (
    <div className="menu-track">
      {!bulk && getPlayOrPauseAction()}

      {playlistName !== NOW_PLAYING_NAME && playlistName !== UPLOADS_NAME && (
        <NowPlayingAdd onClick={nowPlayingAdd} />
      )}

      {playlistName !== UPLOADS_NAME && <PlaylistAdd onClick={playlistAdd} />}

      {!bulk && playlistName !== UPLOADS_NAME && (
        <Download onClick={download} />
      )}

      {getRemoveAction()}
    </div>
  );
});

export { Track };
