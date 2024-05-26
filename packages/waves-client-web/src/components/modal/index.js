import React from 'react'

import { modalTypes } from 'waves-client-constants'

import PlaylistClear from './playlistClear'
import PlaylistCreate from './playlistCreate'
import PlaylistSave from './playlistSave'
import PlaylistSettings from './playlistSettings'
import TracksDelete from './tracksDelete'
import TracksUpload from './tracksUpload'

import './index.css'

const MODALS = {
  null: null,
  [modalTypes.PLAYLIST_CLEAR]: PlaylistClear,
  [modalTypes.PLAYLIST_CREATE]: PlaylistCreate,
  [modalTypes.PLAYLIST_SAVE]: PlaylistSave,
  [modalTypes.PLAYLIST_SETTINGS]: PlaylistSettings,
  [modalTypes.TRACKS_DELETE]: TracksDelete,
  [modalTypes.TRACKS_UPLOAD]: TracksUpload,
}

export default class Modal extends React.PureComponent {
  render() {
    const { history, location, modal } = this.props
    if (!modal) {
      return null
    }
    const { type, props } = modal
    const Component = MODALS[type]
    return (
      <>
        <div className='fixed-full-page modal-backdrop' />
        <Component history={history} location={location} {...props} />
      </>
    )
  }
}
