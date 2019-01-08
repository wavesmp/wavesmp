const types = require('waves-action-types')

function pause() {
  return (dispatch, getState, { player }) => {
    player.pause()
    dispatch({ type: types.PLAYING_PAUSE })
  }
}

function play() {
  return (dispatch, getState, { player }) => {
    player.play()
    dispatch({ type: types.PLAYING_PLAY })
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
    dispatch({ type: types.PLAYING_TIME_UPDATE, currentTime: newTime })
  }
}

function playingTimeUpdate(currentTime) {
  return { type: types.PLAYING_TIME_UPDATE, currentTime }
}

module.exports.pause = pause
module.exports.play = play
module.exports.repeatToggle = repeatToggle
module.exports.shuffleToggle = shuffleToggle
module.exports.seek = seek
module.exports.playingTimeUpdate = playingTimeUpdate
