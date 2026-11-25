import { memo } from "react";

import {
  LIBRARY_NAME,
  NOW_PLAYING_NAME,
  UPLOADS_NAME,
  menuTypes,
  modalTypes,
} from "src/constants";
import { useActions, usePlaying } from "src/providers/hooks";

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

const Track = memo(function Track(ownProps) {
  const actions = useActions();
  const { isPlaying } = usePlaying();
  const props = { ...ownProps, isPlaying, actions };

  const trackToggle = () => {
    const { actions, playlistName, itemIndex, trackId } = props;
    actions.trackToggle(trackId, playlistName, itemIndex);
    actions.menuReset();
  };

  const pause = () => {
    const { actions } = props;
    actions.pause();
    actions.menuReset();
  };

  const play = () => {
    const { actions } = props;
    actions.play();
    actions.menuReset();
  };

  const tracksDelete = () => {
    const { actions } = props;
    actions.modalSet({ type: modalTypes.TRACKS_DELETE });
    actions.menuReset();
  };

  const tracksRemove = async () => {
    const { actions, playlistName } = props;
    try {
      await actions.tracksRemove(playlistName);
      actions.menuReset();
    } catch (err) {
      actions.toastErr(`${err}`);
    }
  };

  const nowPlayingAdd = () => {
    const { actions, playlistName } = props;
    actions.playlistAdd(playlistName, NOW_PLAYING_NAME);
    actions.menuReset();
  };

  const playlistAdd = () => {
    const { actions, playlistName } = props;
    actions.menuNext({
      type: menuTypes.PLAYLIST_ADD,
      props: { currentPlaylist: playlistName },
    });
  };

  const download = () => {
    const { actions, trackId } = props;
    actions.download(trackId);
    actions.menuReset();
  };

  function getPlayOrPauseAction() {
    const { isPlaying, index, itemIndex } = props;
    if (index === itemIndex) {
      if (isPlaying) {
        return <Pause onClick={pause} />;
      }
      return <PlayResume onClick={play} />;
    }
    return <Play onClick={trackToggle} />;
  }

  function getRemoveAction() {
    const { actions, playlistName } = props;
    if (playlistName === LIBRARY_NAME) {
      return <LibraryDelete onClick={tracksDelete} />;
    }
    if (playlistName === UPLOADS_NAME) {
      return <PlaylistRemove onClick={actions.trackUploadsDelete} />;
    }
    return <PlaylistRemove onClick={tracksRemove} />;
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
