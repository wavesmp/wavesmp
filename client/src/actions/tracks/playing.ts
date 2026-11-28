import { actionTypes } from "src/actionTypes";
import type { MediaListener } from "src/player/playerTypes";
import type { Thunk, WavesAction } from "src/types/actionTypes";

import { toastErr } from "../toasts";

function pause(): Thunk<void> {
  return (dispatch, _getState, { player }) => {
    player.pause();
    dispatch({ type: actionTypes.PLAYING_PAUSE });
  };
}

function play(): Thunk<Promise<void>> {
  return async (dispatch, _getState, { player }) => {
    try {
      dispatch({ type: actionTypes.PLAYING_PLAY });
      await player.play();
    } catch (err) {
      dispatch(toastErr(String(err)));
      console.log("Failed to start playing");
      console.log(err);
    }
  };
}

function repeatToggle(): Extract<
  WavesAction,
  { type: typeof actionTypes.PLAYING_REPEAT_TOGGLE }
> {
  return { type: actionTypes.PLAYING_REPEAT_TOGGLE };
}

function shuffleToggle(): Extract<
  WavesAction,
  { type: typeof actionTypes.PLAYING_SHUFFLE_TOGGLE }
> {
  return { type: actionTypes.PLAYING_SHUFFLE_TOGGLE };
}

function seek(newTime: number): Thunk<void> {
  return (_dispatch, _getState, { player }) => {
    void player.seek(newTime);
  };
}

function addOnTimeUpdate(onTimeUpdate: MediaListener): Thunk<void> {
  return (_dispatch, _getState, { player }) => {
    player.addOnTimeUpdate(onTimeUpdate);
  };
}

function removeOnTimeUpdate(onTimeUpdate: MediaListener): Thunk<void> {
  return (_dispatch, _getState, { player }) => {
    player.removeOnTimeUpdate(onTimeUpdate);
  };
}

function getVolume(): Thunk<number | null> {
  return (_dispatch, _getState, { player }) => player.getVolume();
}

function setVolume(volume: number): Thunk<void> {
  return (_dispatch, _getState, { player, localState }) => {
    player.setVolume(volume);
    void localState.setItem("volume", volume);
  };
}

function addOnVolumeChange(onVolumeChange: MediaListener): Thunk<void> {
  return (_dispatch, _getState, { player }) => {
    player.addOnVolumeChange(onVolumeChange);
  };
}

function removeOnVolumeChange(onVolumeChange: MediaListener): Thunk<void> {
  return (_dispatch, _getState, { player }) => {
    player.removeOnVolumeChange(onVolumeChange);
  };
}

export {
  addOnTimeUpdate,
  addOnVolumeChange,
  getVolume,
  pause,
  play,
  removeOnTimeUpdate,
  removeOnVolumeChange,
  repeatToggle,
  seek,
  setVolume,
  shuffleToggle,
};
