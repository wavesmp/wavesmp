import ObjectID from 'bson-objectid'

import * as WavesActions from 'waves-client-actions'
import { LIBRARY_NAME, UPLOADS_NAME } from 'waves-client-constants'

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
        UPLOADS_NAME
      )
    )
  })

  player.setOnToastAdd(toast => {
    store.dispatch(WavesActions.toastAdd(toast))
  })

  /* Recieve data from server */
  ws.setOnLibraryUpdate(lib => {
    store.dispatch(WavesActions.tracksAdd(lib, LIBRARY_NAME))
  })

  ws.setOnPlaylistsUpdate(playlists => {
    store.dispatch(WavesActions.playlistsUpdate(playlists))
  })

  /* Listen for media queries to set layout state */
  const layout0Mql = window.matchMedia('only screen and (min-width: 516px)')
  const layout1Mql = window.matchMedia('only screen and (min-width: 768px)')
  let layout

  function onLayout0(ev) {
    layout = ev.matches ? Math.max(layout, 1) : 0
    store.dispatch(WavesActions.layoutSet(layout))
  }
  function onLayout1(ev) {
    layout = ev.matches ? 2 : Math.min(layout, 1)
    store.dispatch(WavesActions.layoutSet(layout))
  }
  layout0Mql.addEventListener('change', onLayout0)
  layout1Mql.addEventListener('change', onLayout1)
  layout = layout1Mql.matches ? 2 : layout0Mql.matches ? 1 : 0
  store.dispatch(WavesActions.layoutSet(layout))

  document.addEventListener('keydown', ev => {
    store.dispatch(WavesActions.tracksKeyDown(ev, history))
  })

  /* When localStorage is loaded, update the state */
  const [
    columns,
    rowsPerPage,
    lastIdp,
    machineId,
    theme,
    volume
  ] = await Promise.all([
    localState.getItem('columns'),
    localState.getItem('rowsPerPage'),
    localState.getItem('lastIdp'),
    localState.getItem('machineId'),
    localState.getItem('theme'),
    localState.getItem('volume')
  ])
  store.dispatch(
    WavesActions.accountSetSettings({
      columns: new Set(columns),
      rowsPerPage,
      theme
    })
  )
  player.setVolume(volume)
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
