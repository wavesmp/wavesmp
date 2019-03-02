import React from 'react'

import { modalTypes } from 'waves-client-constants'

import ActionConfirm from './actionConfirm'
import PlaylistCreate from './playlistCreate'
import PlaylistSave from './playlistSave'
import PlaylistSettings from './playlistSettings'
import Settings from './settings'
import TracksDelete from './tracksDelete'
import TracksUpload from './tracksUpload'

import './index.css'

const MODALS = {
  null: null,
  [modalTypes.PLAYLIST_CREATE]: PlaylistCreate,
  [modalTypes.PLAYLIST_SAVE]: PlaylistSave,
  [modalTypes.ACTION_CONFIRM]: ActionConfirm,
  [modalTypes.SETTINGS]: Settings,
  [modalTypes.PLAYLIST_SETTINGS]: PlaylistSettings,
  [modalTypes.TRACKS_DELETE]: TracksDelete,
  [modalTypes.TRACKS_UPLOAD]: TracksUpload
}

export default class Modal extends React.PureComponent {
  render() {
    const { modal } = this.props
    if (!modal) {
      return null
    }
    const { type, props } = modal
    if (!MODALS[type]) {
      return null
    }
    const Component = MODALS[type]
    return (
      <React.Fragment>
        <div className='fixed-full-page modal-backdrop' />
        <Component {...props} />
      </React.Fragment>
    )
  }
}
