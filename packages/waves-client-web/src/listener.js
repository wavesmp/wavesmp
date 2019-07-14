import ObjectID from 'bson-objectid'

import * as WavesActions from 'waves-client-actions'
import { libTypes } from 'waves-client-constants'

export default async (store, ws, player, localState, history) => {
  store.dispatch(WavesActions.routerChange(history.location))
  history.listen(location => {
    store.dispatch(WavesActions.routerChange(location))
  })

  /* When track ends, update the state */
  player.setOnTrackEnded(() => {
    store.dispatch(WavesActions.trackEnded(URLSearchParams))
  })

  player.setOnUploadProgress((trackId, progress) => {
    store.dispatch(
      WavesActions.tracksLocalInfoUpdate(
        trackId,
        'uploadProgress',
        progress,
        libTypes.UPLOADS
      )
    )
  })

  player.setOnToastAdd(toast => {
    store.dispatch(WavesActions.toastAdd(toast))
  })

  /* Recieve data from server */
  ws.setOnLibraryUpdate(lib => {
    store.dispatch(WavesActions.tracksAdd(lib, libTypes.WAVES))
  })

  ws.setOnPlaylistsUpdate(playlists => {
    store.dispatch(WavesActions.playlistsUpdate(playlists))
  })

  /* Listen for media queries to prevent transitions */
  enquire.register('only screen and (min-width: 768px)', {
    /* On big screens, enable sidebar transitions */
    match: () => {
      store.dispatch(WavesActions.transitionMainSet(true))
    },
    /* When going from small to big screen (big format change),
     * disable sidebar transitions. Sidebar snaps into place */
    unmatch: () => {
      store.dispatch(WavesActions.transitionMainSet(false))
    }
  })

  document.addEventListener('keydown', ev => {
    store.dispatch(WavesActions.tracksKeyDown(ev, history))
  })

  /* When localStorage is loaded, update the state */
  const [columns, rowsPerPage, lastIdp, machineId, theme] = await Promise.all([
    localState.getItem('columns'),
    localState.getItem('rowsPerPage'),
    localState.getItem('lastIdp'),
    localState.getItem('machineId'),
    localState.getItem('theme')
  ])
  store.dispatch(
    WavesActions.accountSetSettings(new Set(columns), rowsPerPage, theme)
  )
  ObjectID.setMachineID(machineId)
  if (lastIdp) {
    try {
      await store.dispatch(WavesActions.tryAutoLogin(lastIdp))
      store.dispatch(WavesActions.retryLoginOnConnect(lastIdp))
    } catch (err) {
      store.dispatch(WavesActions.err(err))
      store.dispatch(WavesActions.accountSetFetchingUser(false))
    }
  } else {
    store.dispatch(WavesActions.accountSetFetchingUser(false))
  }
}
