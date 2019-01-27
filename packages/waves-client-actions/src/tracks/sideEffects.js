const { toastTypes } = require('waves-client-constants')

const { toastAdd } = require('../toasts')

function download(id) {
  return async (dispatch, getState, { player }) => {
    const { tracks } = getState()
    const { library } = tracks
    // TODO should refactor with getTrackById.. but without uploads
    const track = library[id]

    try {
      await player.download(track)
      toastAdd({ type: toastTypes.Success, msg: 'Download started' })(dispatch)
    } catch (err) {
      console.log('Download failed')
      console.log(err)
      toastAdd({ type: toastTypes.Error, msg: `Download failed: ${err}` })
    }
  }
}

module.exports.download = download
