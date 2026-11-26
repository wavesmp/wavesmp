import type { JSX, Ref } from "react";
import { memo } from "react";

import type { BoundActions } from "src/providers/dispatcher";
import type { Playing } from "src/types/stateTypes";

const MAX_TITLE_LEN = 21;
const MAX_ARTIST_LEN = 28;

interface TrackInfoProps {
  trackTitle: string | undefined;
  trackArtist: string | undefined;
}

const TrackInfo = memo(function TrackInfo(props: TrackInfoProps): JSX.Element {
  function shorten(
    s: string | undefined,
    maxLength: number,
  ): string | undefined {
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

interface ButtonsProps {
  playing: Playing;
  actions: BoundActions;
}

const LeftButtons = memo(function LeftButtons(
  props: ButtonsProps,
): JSX.Element {
  const onTrackNext = (): void => {
    const { actions } = props;
    void actions.trackNext(URLSearchParams);
  };

  const onTrackPrevious = (): void => {
    const { actions } = props;
    void actions.trackPrevious(URLSearchParams);
  };

  const { playing, actions } = props;
  const { isPlaying } = playing;
  let playOrPauseClass;
  let onPlayPauseClick;
  if (isPlaying) {
    playOrPauseClass = "fa fa-lg fa-pause trackplayer-btn";
    onPlayPauseClick = (): void => {
      actions.pause();
    };
  } else {
    playOrPauseClass = "fa fa-lg fa-play trackplayer-btn";
    onPlayPauseClick = (): void => {
      void actions.play();
    };
  }
  return (
    <div className="trackplayer-left">
      <i className="fa fa-backward trackplayer-btn" onClick={onTrackPrevious} />
      <i className={playOrPauseClass} onClick={onPlayPauseClick} />
      <i className="fa fa-forward trackplayer-btn" onClick={onTrackNext} />
    </div>
  );
});

const RightButtons = memo(function RightButtons(
  props: ButtonsProps,
): JSX.Element {
  const onShuffleClick = (): void => {
    const { playing, actions } = props;
    const { shuffle } = playing;
    actions.shuffleToggle();
    const msg = `Shuffle ${shuffle ? "Dis" : "En"}abled`;
    actions.toastSuccess(msg);
  };

  const onRepeatClick = (): void => {
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

interface PlayerProps extends ButtonsProps {
  ref?: Ref<HTMLDivElement>;
}

const Player = memo(function Player({
  ref,
  ...props
}: PlayerProps): JSX.Element {
  const { playing, actions } = props;
  const { track } = playing;
  return (
    <div className="trackplayer" ref={ref}>
      <LeftButtons playing={playing} actions={actions} />
      <TrackInfo trackTitle={track?.title} trackArtist={track?.artist} />
      <RightButtons playing={playing} actions={actions} />
    </div>
  );
});

export { Player };
