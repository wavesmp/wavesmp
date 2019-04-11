import React from 'react'
import { Link } from 'react-router-dom'

import { modalTypes, toastTypes } from 'waves-client-constants'

export default class SettingsBar extends React.PureComponent {
  onUnsupportedFeatureClick = () => {
    const { actions } = this.props
    actions.toastAdd({ type: toastTypes.Error, msg: 'Feature Unavailable' })
  }

  onBackClick = () => {
    const { actions } = this.props
    actions.sidebarModeSet('main')
  }

  onSettingsClick = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.SETTINGS })
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
              <i className='fa-fw fa fa-lg fa-arrow-left' />
              <span className='sidebar-back-text'>Back</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span className='sidebar-divider'>
              <span>Notifications</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={this.onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-file-text' />
              <span>File name mismatches</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={this.onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-tags' />
              <span>Missing metadata</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={this.onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-file-o' />
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
              <i className='fa-fw fa fa-lg fa-cog' />
              <span>Account Settings</span>
            </span>
          </li>
          <li className='sidebar-playlist'>
            <span onClick={this.onUnsupportedFeatureClick}>
              <i className='fa-fw fa fa-lg fa-sign-out' />
              <span>Sign out</span>
            </span>
          </li>
        </ul>
      </div>
    )
  }
}
