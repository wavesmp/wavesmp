import React from 'react'

import constants from 'waves-client-constants'

export function onRowDoubleClick(actions, playlistName) {
  return ev => {
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR)
    const index = parseInt(ev.currentTarget.getAttribute(constants.INDEX_ATTR))
    actions.trackToggle(trackId, playlistName, index)
  }
}
