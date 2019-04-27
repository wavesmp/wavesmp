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
      toastAdd({ type: toastTypes.Error, msg: err.toString() })(dispatch)
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

function addOnTimeUpdate(setOnTimeUpdate) {
  return (dispatch, getState, { player }) => {
    player.addOnTimeUpdate(setOnTimeUpdate)
  }
}

function removeOnTimeUpdate(setOnTimeUpdate) {
  return (dispatch, getState, { player }) => {
    player.removeOnTimeUpdate(setOnTimeUpdate)
  }
}

module.exports.pause = pause
module.exports.play = play
module.exports.repeatToggle = repeatToggle
module.exports.shuffleToggle = shuffleToggle
module.exports.seek = seek
module.exports.addOnTimeUpdate = addOnTimeUpdate
module.exports.removeOnTimeUpdate = removeOnTimeUpdate
