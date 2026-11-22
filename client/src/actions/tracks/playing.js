import { actionTypes } from "src/actionTypes";

import { toastErr } from "../toasts";

function pause() {
  return (dispatch, getState, { player }) => {
    player.pause();
    dispatch({ type: actionTypes.PLAYING_PAUSE });
  };
}

function play() {
  return async (dispatch, _, { player }) => {
    try {
      dispatch({ type: actionTypes.PLAYING_PLAY });
      await player.play();
    } catch (err) {
      dispatch(toastErr(`${err}`));
      console.log("Failed to start playing");
      console.log(err);
    }
  };
}

function repeatToggle() {
  return { type: actionTypes.PLAYING_REPEAT_TOGGLE };
}

function shuffleToggle() {
  return { type: actionTypes.PLAYING_SHUFFLE_TOGGLE };
}

function seek(newTime) {
  return (dispatch, getState, { player }) => {
    player.seek(newTime);
  };
}

function addOnTimeUpdate(onTimeUpdate) {
  return (dispatch, getState, { player }) => {
    player.addOnTimeUpdate(onTimeUpdate);
  };
}

function removeOnTimeUpdate(onTimeUpdate) {
  return (dispatch, getState, { player }) => {
    player.removeOnTimeUpdate(onTimeUpdate);
  };
}

function getVolume() {
  return (dispatch, getState, { player }) => {
    return player.getVolume();
  };
}

function setVolume(volume) {
  return (dispatch, getState, { player, localState }) => {
    player.setVolume(volume);
    localState.setItem("volume", volume);
  };
}

function addOnVolumeChange(onVolumeChange) {
  return (dispatch, getState, { player }) => {
    player.addOnVolumeChange(onVolumeChange);
  };
}

function removeOnVolumeChange(onVolumeChange) {
  return (dispatch, getState, { player }) => {
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
