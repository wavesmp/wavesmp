import type { ChangeEvent, JSX, Ref, SyntheticEvent } from "react";
import { memo, useEffect, useState } from "react";

import type { BoundActions } from "src/providers/dispatcher";
import type { Track } from "src/types/trackTypes";

import "./trackslider.css";

interface TrackSliderProps {
  ref?: Ref<HTMLInputElement>;
  actions: BoundActions;
  /* The slider is only shown for a playing track */
  track: Pick<Track, "duration">;
}

const TrackSlider = memo(function TrackSlider({
  ref,
  actions,
  track,
}: TrackSliderProps): JSX.Element {
  const [seeking, setSeeking] = useState(false);
  const [seekingValue, setSeekingValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    function onTimeUpdate(ev: Event): void {
      if (ev.currentTarget instanceof HTMLMediaElement) {
        setCurrentTime(ev.currentTarget.currentTime);
      }
    }
    actions.addOnTimeUpdate(onTimeUpdate);
    return (): void => {
      actions.removeOnTimeUpdate(onTimeUpdate);
    };
  }, [actions]);

  function onMouseDown(): void {
    setSeeking(true);
  }

  function onChange(ev: ChangeEvent<HTMLInputElement>): void {
    setSeekingValue(Number(ev.currentTarget.value));
  }

  function onMouseUp(ev: SyntheticEvent<HTMLInputElement>): void {
    const { duration } = track;
    const time = Number(ev.currentTarget.value) * duration;
    actions.seek(time);
    setSeeking(false);
    setCurrentTime(time);
  }

  const value = seeking ? seekingValue : currentTime / track.duration;
  return (
    <input
      ref={ref}
      type="range"
      min="0.0"
      max="1.0"
      step="0.001"
      value={value}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
      onChange={onChange}
      className="trackslider"
    />
  );
});

export { TrackSlider };
