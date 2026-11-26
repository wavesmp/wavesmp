import { memo, useEffect, useState } from "react";

import "./trackslider.css";

const TrackSlider = memo(function TrackSlider({ ref, actions, playing }) {
  const [seeking, setSeeking] = useState(false);
  const [seekingValue, setSeekingValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    function onTimeUpdate(ev) {
      setCurrentTime(ev.currentTarget.currentTime);
    }
    actions.addOnTimeUpdate(onTimeUpdate);
    return () => actions.removeOnTimeUpdate(onTimeUpdate);
  }, [actions]);

  function onMouseDown() {
    setSeeking(true);
  }

  function onChange(ev) {
    setSeekingValue(ev.currentTarget.value);
  }

  function onMouseUp(ev) {
    const { duration } = playing.track;
    const time = ev.target.value * duration;
    actions.seek(time);
    setSeeking(false);
    setCurrentTime(time);
  }

  const value = seeking ? seekingValue : currentTime / playing.track.duration;
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
