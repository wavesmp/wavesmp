import type { ChangeEvent, JSX } from "react";
import { memo, useEffect, useRef, useState } from "react";

import type { BoundActions } from "src/providers/dispatcher";

interface VolumeSliderProps {
  actions: BoundActions;
}

const VolumeSlider = memo(function VolumeSlider({
  actions,
}: VolumeSliderProps): JSX.Element {
  const [volume, setVolume] = useState(() => actions.getVolume() ?? 0);
  /* Volume to restore when unmuting */
  const resetVolumeVal = useRef<number | null>(null);

  useEffect(() => {
    function onVolumeChange(ev: Event): void {
      if (ev.currentTarget instanceof HTMLMediaElement) {
        setVolume(ev.currentTarget.volume);
      }
    }
    actions.addOnVolumeChange(onVolumeChange);
    return (): void => {
      actions.removeOnVolumeChange(onVolumeChange);
    };
  }, [actions]);

  function onVolumeInputChange(ev: ChangeEvent<HTMLInputElement>): void {
    actions.setVolume(ev.target.valueAsNumber);
    resetVolumeVal.current = null;
  }

  function onResetVolume(): void {
    if (volume > 0) {
      resetVolumeVal.current = volume;
      actions.setVolume(0);
    } else if (resetVolumeVal.current) {
      actions.setVolume(resetVolumeVal.current);
    } else {
      actions.setVolume(0.05);
    }
  }

  let iconClass = "fa fa-lg fa-volume-up settings-volume-icon";
  if (volume <= 0) {
    iconClass = "fa fa-lg fa-volume-off settings-volume-icon";
  } else if (volume < 0.5) {
    iconClass = "fa fa-lg fa-volume-down settings-volume-icon";
  }

  return (
    <div className="settings-slider-wrapper">
      <i className={iconClass} onClick={onResetVolume} />
      <input
        type="range"
        min="0.0"
        max="1.0"
        step="0.001"
        className="settings-volume-slider"
        value={volume}
        onChange={onVolumeInputChange}
      />
    </div>
  );
});

export { VolumeSlider };
