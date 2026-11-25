import { memo } from "react";

const MAX_TITLE_LEN = 21;
const MAX_ARTIST_LEN = 28;

const TrackInfo = memo(function TrackInfo(props) {
  function shorten(s, maxLength) {
    if (s && s.length > maxLength) {
      return s.substring(0, maxLength + 1);
    }
    return s;
  }

  const trackTitle = shorten(props.trackTitle, MAX_TITLE_LEN);
  const trackArtist = shorten(props.trackArtist, MAX_ARTIST_LEN);
  return (
    <div>
      <div className="trackplayer-info-title">{trackTitle}</div>
      <div className="trackplayer-info-artist">{trackArtist}</div>
    </div>
  );
});

const LeftButtons = memo(function LeftButtons(props) {
  const onTrackNext = () => {
    const { actions } = props;
    actions.trackNext(URLSearchParams);
  };

  const onTrackPrevious = () => {
    const { actions } = props;
    actions.trackPrevious(URLSearchParams);
  };

  const { playing, actions } = props;
  const { isPlaying } = playing;
  let playOrPauseClass;
  let onPlayPauseClick;
  if (isPlaying) {
    playOrPauseClass = "fa fa-lg fa-pause trackplayer-btn";
    onPlayPauseClick = actions.pause;
  } else {
    playOrPauseClass = "fa fa-lg fa-play trackplayer-btn";
    onPlayPauseClick = actions.play;
  }
  return (
    <div className="trackplayer-left">
      <i className="fa fa-backward trackplayer-btn" onClick={onTrackPrevious} />
      <i className={playOrPauseClass} onClick={onPlayPauseClick} />
      <i className="fa fa-forward trackplayer-btn" onClick={onTrackNext} />
    </div>
  );
});

const RightButtons = memo(function RightButtons(props) {
  const onShuffleClick = () => {
    const { playing, actions } = props;
    const { shuffle } = playing;
    actions.shuffleToggle();
    const msg = `Shuffle ${shuffle ? "Dis" : "En"}abled`;
    actions.toastSuccess(msg);
  };

  const onRepeatClick = () => {
    const { playing, actions } = props;
    const { repeat } = playing;
    actions.repeatToggle();
    const msg = `Repeat ${repeat ? "Dis" : "En"}abled`;
    actions.toastSuccess(msg);
  };

  const { playing } = props;
  const { repeat, shuffle } = playing;

  let repeatButtonClass = "fa fa-lg fa-repeat trackplayer-btn";
  if (repeat) {
    repeatButtonClass += " trackplayer-btn-active";
  }

  let shuffleButtonClass = "fa fa-lg fa-random trackplayer-btn";
  if (shuffle) {
    shuffleButtonClass += " trackplayer-btn-active";
  }
  return (
    <div className="trackplayer-right">
      <i className={shuffleButtonClass} onClick={onShuffleClick} />
      <i className={repeatButtonClass} onClick={onRepeatClick} />
    </div>
  );
});

const Player = memo(function Player(props) {
  const { playing, actions } = props;
  const { track } = playing;
  return (
    <div className="trackplayer">
      <LeftButtons playing={playing} actions={actions} />
      <TrackInfo trackTitle={track.title} trackArtist={track.artist} />
      <RightButtons playing={playing} actions={actions} />
    </div>
  );
});

export { Player };
