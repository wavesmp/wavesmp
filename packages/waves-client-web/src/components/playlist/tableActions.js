import React from 'react'

import constants from 'waves-client-constants'

export function onRowDoubleClick(actions, playlistName) {
  return ev => {
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR)
    const playId = ev.currentTarget.getAttribute(constants.PLAY_INDEX_ATTR)
    actions.trackToggle(trackId, playlistName, playId)
  }
}
