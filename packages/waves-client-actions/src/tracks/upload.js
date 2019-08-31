const types = require('waves-action-types')
const { LIBRARY_NAME, UPLOADS_NAME } = require('waves-client-constants')
const { UploadError } = require('waves-client-errors')

const { toastErr, toastSuccess } = require('../toasts')
const { tracksAdd } = require('./add')

function tracksUpload(trackSource) {
  return async (dispatch, getState, { player, ws }) => {
    /* Transition tracks to uploading state */
    const { tracks } = getState()
    const { playing, libraries, playlists } = tracks
    const { track } = playing
    const uploads = libraries[UPLOADS_NAME]
    const uploadIds = Object.keys(uploads)
    dispatch({
      type: types.TRACKS_INFO_UPDATE,
      ids: uploadIds,
      key: 'state',
      value: 'uploading',
      libName: UPLOADS_NAME
    })
    dispatch({
      type: types.TRACKS_INFO_UPDATE,
      ids: uploadIds,
      key: 'uploadProgress',
      value: 0,
      libName: UPLOADS_NAME
    })

    /* Upload tracks to cloud */
    const uploadValues = Object.values(uploads)
    const uploadPromises = await player.upload(trackSource, uploadValues)
    const result = await handleUploadPromises(uploadPromises, dispatch)
    const { uploaded } = result

    /* Upload metadata to server */
    try {
      await ws.sendAckedMessage(types.TRACKS_ADD, { tracks: uploaded })
    } catch (serverErr) {
      console.log('Failed to upload tracks to server')
      console.log(serverErr)
      dispatch(toastErr(`Upload failure: ${serverErr}`))
      result.serverErr = serverErr
      return result
    }
    const uploadedIds = new Set(uploaded.map(t => t.id))
    if (track && uploadedIds.has(track.id)) {
      /* Pause before deleting from state. Otherwise,
       * player may emit time change before
       * it is deleted from state */
      player.pause()
    }

    /* Delete tracks from uploads. Add to library */
    dispatch({
      type: types.TRACKS_DELETE,
      deleteIds: uploadedIds,
      libName: UPLOADS_NAME
    })
    dispatch(tracksAdd(uploaded, LIBRARY_NAME))
    return result
  }
}

async function handleUploadPromises(promises, dispatch) {
  const uploaded = []
  const uploadErrs = []
  await Promise.all(
    promises.map(async promise => {
      try {
        const track = await promise
        const { file } = track
        delete track.file
        unprocessTrack(track)
        dispatch(toastSuccess(`Uploaded ${file.name}`))
        uploaded.push(track)
      } catch (err) {
        if (err instanceof UploadError) {
          dispatch(toastErr(`${err.track.file.name}: ${err.cause}`))
          console.log('Track upload failure')
          console.log(err)
          console.log(err.cause)
        } else {
          // Should not be reached
          dispatch(toastErr(`${err}`))
          console.log('Expected upload error but got:')
          console.log(err)
        }
        uploadErrs.push(err)
      }
    })
  )
  return { uploaded, uploadErrs }
}

function unprocessTrack(track) {
  delete track.createdAt
  delete track.createdAtPretty
}

module.exports.tracksUpload = tracksUpload
