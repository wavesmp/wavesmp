const { LIBRARY_NAME, toastTypes } = require('waves-client-constants')

const { toastAdd } = require('../toasts')

function download(id) {
  return async (dispatch, getState, { player }) => {
    const { tracks } = getState()
    const { libraries } = tracks
    const lib = libraries[LIBRARY_NAME]
    const track = lib[id]

    try {
      await player.download(track)
      dispatch(toastAdd({ type: toastTypes.Success, msg: 'Download started' }))
    } catch (err) {
      console.log('Download failed')
      console.log(err)
      dispatch(
        toastAdd({ type: toastTypes.Error, msg: `Download failed: ${err}` })
      )
    }
  }
}

module.exports.download = download
