import React from 'react'
import { Link } from 'react-router-dom'

import { modalTypes } from 'waves-client-constants'

function onUnsupportedFeatureClick(ev) {
  toastr.error('This feature is coming soon!', 'Feature Unavailable')
}

export default class SettingsBar extends React.Component {
  onBackClick = () => {
    const { actions } = this.props
    actions.sidebarModeSet('main')
  }

  onSettingsClick = () => {
    const { actions } = this.props
    actions.modalSet({type: modalTypes.SETTINGS})
  }

  render() {
    const { playlists, isPlayerVisible, userName } = this.props
    let className = 'sidebar-container-wide'
    if (isPlayerVisible) {
      className += ' sidebar-container-player-visible'
    }
    return (
      <div id='sidebar-container' className={className}>
        <ul className='nav'>
          <li>
            <span onClick={this.onBackClick}>
              <i className='fa-fw fa fa-lg fa-arrow-left'></i>
              <span style={{padding: '0px 15px'}}>Back</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span className='sidebar-divider'>
              <span>Notifications</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-file-text'></i>
              <span>File name mismatches</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-tags'></i>
              <span>Missing metadata</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-file-o'></i>
              <span>Missing files</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span className='sidebar-divider'>
              <span>User: {userName}</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={this.onSettingsClick}>
              <i className='fa-fw fa fa-lg fa-cog'></i>
              <span>Account Settings</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-sign-out'></i>
              <span>Sign out</span>
            </span>
          </li>
        </ul>
      </div>
    )
  }
}
