import React from 'react'

import ActionConfirm from './actionConfirm'
import PlaylistSave from './playlistsave'
import PlaylistSettings from './playlistsettings'
import Settings from './settings'
import TracksDelete from './tracksDelete'

import './index.css'

const MODALS = {
  null: null,
  playlistSave: PlaylistSave,
  actionConfirm: ActionConfirm,
  settings: Settings,
  playlistSettings: PlaylistSettings,
  tracksDelete: TracksDelete
}

export default class Modal extends React.Component {
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
        <div className='fixed-full-page modal-backdrop'/>
        <Component {...props}/>
      </React.Fragment>
    )
  }
}
