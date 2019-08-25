import React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'

import './index.css'
import MainBar from './main'
import PlaylistBar from './playlist'

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
    const isSliderVisible = playing.track != null
    let playlistBar = null
    let mainBar = null
    if (sidebar) {
      playlistBar = (
        <PlaylistBar
          key={0}
          isSliderVisible={isSliderVisible}
          actions={actions}
          playlists={playlists}
        />
      )
    } else {
      mainBar = (
        <MainBar
          key={0}
          actions={actions}
          isSliderVisible={isSliderVisible}
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
      </span>
    )
  }
}
