import React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'

import './index.css'
import MainBar from './main'
import PlaylistBar from './playlist'
import SettingsBar from './settings'

export default class SideBar extends React.PureComponent {
  render() {
    const {
      actions,
      playing,
      playlists,
      sidebar,
      pathname,
      userName
    } = this.props
    let isPlayerVisible = playing.track !== null
    let playlistBar = null
    let mainBar = null
    let settingsBar = null
    if (sidebar === 'playlist') {
      playlistBar = (
        <PlaylistBar
          key={0}
          isPlayerVisible={isPlayerVisible}
          actions={actions}
          playlists={playlists}
        />
      )
    } else if (sidebar === 'settings') {
      settingsBar = (
        <SettingsBar
          key={0}
          isPlayerVisible={isPlayerVisible}
          actions={actions}
          userName={userName}
        />
      )
    } else {
      mainBar = (
        <MainBar
          key={0}
          actions={actions}
          isPlayerVisible={isPlayerVisible}
          playlists={playlists}
          pathname={pathname}
        />
      )
    }
    return (
      <span>
        <CSSTransitionGroup
          transitionName='mainbartransition'
          transitionEnterTimeout={SIDEBAR_ENTER_TIMEOUT}
          transitionLeaveTimeout={SIDEBAR_LEAVE_TIMEOUT}
        >
          {mainBar}
        </CSSTransitionGroup>
        <CSSTransitionGroup
          transitionName='playlistbartransition'
          transitionEnterTimeout={SIDEBAR_ENTER_TIMEOUT}
          transitionLeaveTimeout={SIDEBAR_LEAVE_TIMEOUT}
        >
          {playlistBar}
        </CSSTransitionGroup>
        <CSSTransitionGroup
          transitionName='playlistbartransition'
          transitionEnterTimeout={SIDEBAR_ENTER_TIMEOUT}
          transitionLeaveTimeout={SIDEBAR_LEAVE_TIMEOUT}
        >
          {settingsBar}
        </CSSTransitionGroup>
      </span>
    )
  }
}
