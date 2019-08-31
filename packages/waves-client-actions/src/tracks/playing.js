const types = require('waves-action-types')
const { toastTypes } = require('waves-client-constants')

const { toastAdd } = require('../toasts')

function pause() {
  return (dispatch, getState, { player }) => {
    player.pause()
    dispatch({ type: types.PLAYING_PAUSE })
  }
}

function play() {
  return async (dispatch, getState, { player }) => {
    try {
      dispatch({ type: types.PLAYING_PLAY })
      await player.play()
    } catch (err) {
      dispatch(toastAdd({ type: toastTypes.Error, msg: `${err}` }))
      console.log('Failed to start playing')
      console.log(err)
    }
  }
}

function repeatToggle() {
  return { type: types.PLAYING_REPEAT_TOGGLE }
}

function shuffleToggle() {
  return { type: types.PLAYING_SHUFFLE_TOGGLE }
}

function seek(newTime) {
  return (dispatch, getState, { player }) => {
    player.seek(newTime)
  }
}

function addOnTimeUpdate(onTimeUpdate) {
  return (dispatch, getState, { player }) => {
    player.addOnTimeUpdate(onTimeUpdate)
  }
}

function removeOnTimeUpdate(onTimeUpdate) {
  return (dispatch, getState, { player }) => {
    player.removeOnTimeUpdate(onTimeUpdate)
  }
}

function getVolume() {
  return (dispatch, getState, { player }) => {
    return player.getVolume()
  }
}

function setVolume(volume) {
  return (dispatch, getState, { player, localState }) => {
    player.setVolume(volume)
    localState.setItem('volume', volume)
  }
}

function addOnVolumeChange(onVolumeChange) {
  return (dispatch, getState, { player }) => {
    player.addOnVolumeChange(onVolumeChange)
  }
}

function removeOnVolumeChange(onVolumeChange) {
  return (dispatch, getState, { player }) => {
    player.removeOnVolumeChange(onVolumeChange)
  }
}

module.exports.pause = pause
module.exports.play = play
module.exports.repeatToggle = repeatToggle
module.exports.shuffleToggle = shuffleToggle
module.exports.seek = seek
module.exports.addOnTimeUpdate = addOnTimeUpdate
module.exports.removeOnTimeUpdate = removeOnTimeUpdate
module.exports.getVolume = getVolume
module.exports.setVolume = setVolume
module.exports.addOnVolumeChange = addOnVolumeChange
module.exports.removeOnVolumeChange = removeOnVolumeChange
