const actionTypes = require('waves-action-types')

/*
 * TODO probably want to move to a model where updates
 * (e.g. elapsed, startDate) * come from track progress
 * callback
 */

const initialPlaying = {
  isPlaying: false,
  playlist: null,
  track: null,
  shuffle: false,
  repeat: false,
  seeking: false,
  elapsed: 0,
  startDate: null
}

function reducerPlaying(playing = initialPlaying, action) {
  switch (action.type) {
    case actionTypes.PLAYING_PLAY: {
      const { startDate } = action
      return {
        ...playing,
        isPlaying: true,
        startDate
      }
    }

    case actionTypes.PLAYING_PAUSE: {
      const { elapsed } = action
      return {
        ...playing,
        isPlaying: false,
        elapsed
      }
    }

    case actionTypes.PLAYING_SHUFFLE_TOGGLE: {
        return {...playing, shuffle: !playing.shuffle, repeat: false}
    }

    case actionTypes.PLAYING_REPEAT_TOGGLE: {
      return {...playing, repeat: !playing.repeat, shuffle: false}
    }

    case actionTypes.PLAYING_TRACK_REPEAT: {
      const { startDate } = action
      return {...playing, startDate}
    }

    case actionTypes.PLAYING_SEEK: {
      const { startDate } = action
      return {...playing, startDate}
    }

    case actionTypes.TRACK_NEXT: {
      const { nextTrack, startDate } = action
      if (nextTrack) {
        return {
          ...playing,
          track: nextTrack,
          startDate,
          elapsed: 0
        }
      }
      return {...playing, isPlaying: false}
    }

    case actionTypes.TRACK_TOGGLE: {
      const { playlistName, track, startDate } = action
      return {
        ...playing,
        isPlaying: true,
        track,
        startDate,
        elapsed: 0,
        playlist: playlistName
      }
    }

    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action
      const { track } = playing
      if (track && deleteIds.has(track.id)) {
        return {...initialPlaying}
      }
      return playing
    }
    case actionTypes.TRACK_UPLOADS_DELETE: {
      const { deleteIds } = action
      const { track } = playing
      if (track && deleteIds.has(track.id)) {
        return {...initialPlaying}
      }
      return playing
    }
    default:
      return playing
  }
}

module.exports = reducerPlaying
