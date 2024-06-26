const actionTypes = require("waves-action-types");

const initialPlaying = {
  isPlaying: false,
  playlist: null,
  track: null,
  shuffle: false,
  repeat: false,
};

function reducerPlaying(playing = initialPlaying, action) {
  switch (action.type) {
    case actionTypes.PLAYING_PLAY: {
      return {
        ...playing,
        isPlaying: true,
      };
    }

    case actionTypes.PLAYING_PAUSE: {
      return {
        ...playing,
        isPlaying: false,
      };
    }

    case actionTypes.PLAYING_SHUFFLE_TOGGLE: {
      return { ...playing, shuffle: !playing.shuffle, repeat: false };
    }

    case actionTypes.PLAYING_REPEAT_TOGGLE: {
      return { ...playing, repeat: !playing.repeat, shuffle: false };
    }

    case actionTypes.TRACK_NEXT: {
      const { nextTrack } = action;
      if (nextTrack) {
        return {
          ...playing,
          track: nextTrack,
        };
      }
      return { ...playing, isPlaying: false };
    }

    case actionTypes.TRACK_TOGGLE: {
      const { playlistName, track } = action;
      return {
        ...playing,
        isPlaying: true,
        track,
        playlist: playlistName,
      };
    }

    case actionTypes.TRACKS_INFO_UPDATE: {
      const { ids, key, value } = action;
      const { track } = playing;
      if (track && ids.includes(track.id)) {
        return {
          ...playing,
          track: {
            ...track,
            [key]: value,
          },
        };
      }
      return playing;
    }

    case actionTypes.TRACKS_REMOVE: {
      const { deletePlaying } = action;
      if (deletePlaying) {
        return { ...initialPlaying };
      }
      return playing;
    }

    case actionTypes.TRACKS_DELETE: {
      const { deleteIds } = action;
      const { track } = playing;
      if (track && deleteIds.has(track.id)) {
        return { ...initialPlaying };
      }
      return playing;
    }
    default:
      return playing;
  }
}

module.exports = reducerPlaying;
