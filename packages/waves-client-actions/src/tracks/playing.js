const types = require('waves-action-types')

function pause() {
  return (dispatch, getState, { player }) => {
    const { tracks } = getState()
    const { playing } = tracks
    const { startDate } = playing
    const elapsed = new Date() - startDate
    player.pause()
    dispatch({ type: types.PLAYING_PAUSE, elapsed })
  }
}

function play() {
  return (dispatch, getState, { player }) => {
    const { tracks } = getState()
    const { playing } = tracks
    const { elapsed } = playing
    const startDate = new Date() - elapsed
    player.play()
    dispatch({ type: types.PLAYING_PLAY, startDate })
  }
}

function repeatToggle() {
  return { type: types.PLAYING_REPEAT_TOGGLE }
}

function shuffleToggle() {
  return { type: types.PLAYING_SHUFFLE_TOGGLE }
}

function seek(pos, duration) {
  return (dispatch, getState, { player }) => {
    const elapsed = pos * duration
    const startDate = new Date() - elapsed * 1000
    player.seek(elapsed)
    dispatch({ type: types.PLAYING_SEEK, startDate })
  }
}

module.exports.pause = pause
module.exports.play = play
module.exports.repeatToggle = repeatToggle
module.exports.shuffleToggle = shuffleToggle
module.exports.seek = seek
