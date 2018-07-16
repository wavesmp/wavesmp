import ObjectID from 'bson-objectid'
import Promise from 'bluebird'

import * as WavesActions from 'waves-client-actions'

export default async (store, ws, player, localState) => {
  /* When track ends, update the state */
  player.setOnTrackEnded(() => {
    store.dispatch(WavesActions.trackEnded(URLSearchParams))
  })

  /* Recieve data from server */
  ws.setOnLibraryUpdate(lib => {
    store.dispatch(WavesActions.tracksUpdate(lib))
  })

  ws.setOnPlaylistsUpdate(playlists => {
    store.dispatch(WavesActions.playlistsUpdate(playlists))
  })

  // TODO should this really be called transitions?
  // What if other things rely on 768px
  /* Listen for media queries to prevent transitions */
  enquire.register("only screen and (min-width: 768px)", {
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

  /* When localStorage is loaded, update the state */
  const [ columns, rowsPerPage, lastIdp, machineId ] = await Promise.all([
    localState.getItem('columns'),
    localState.getItem('rowsPerPage'),
    localState.getItem('lastIdp'),
    localState.getItem('machineId')
  ])
  if (lastIdp) {
    store.dispatch(WavesActions.tryAutoLogin(lastIdp))
  } else {
    // fetchingUser initially true
    store.dispatch(WavesActions.accountSetFetchingUser(false))
  }
  store.dispatch(WavesActions.accountSetSettings(new Set(columns), rowsPerPage))
  ObjectID.setMachineID(machineId)
}
