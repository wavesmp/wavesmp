import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { Link } from 'react-router-dom'

import './index.css'
import MainBar from './main'
import PlaylistBar from './playlist'
import SettingsBar from './settings'

export default class SideBar extends React.Component {
  render() {
    const { actions, playing,
            playlists, sidebar, location,
            userName } = this.props
    let isPlayerVisible = playing.track !== null
    let playlistBar = null
    let mainBar = null
    let settingsBar = null
    if (sidebar === 'playlist') {
      playlistBar = <PlaylistBar key={0}
                                 isPlayerVisible={isPlayerVisible}
                                 actions={actions}
                                 playlists={playlists}/>
    } else if (sidebar === 'settings') {
      // TODO probably want to use hamburger menu for small screens
      settingsBar = <SettingsBar key={0}
                                 isPlayerVisible={isPlayerVisible}
                                 actions={actions}
                                 userName={userName}/>
    } else {
      mainBar = <MainBar key={0}
                         actions={actions}
                         isPlayerVisible={isPlayerVisible}
                         playlists={playlists}
                         location={location}/>
    }
    return (
      <span>
        <ReactCSSTransitionGroup transitionName='mainbartransition'
                                 transitionEnterTimeout={2000}
                                 transitionLeaveTimeout={1000}>
          {mainBar}
        </ReactCSSTransitionGroup>
        <ReactCSSTransitionGroup transitionName='playlistbartransition'
                                 transitionEnterTimeout={2000}
                                 transitionLeaveTimeout={1000}>
          {playlistBar}
        </ReactCSSTransitionGroup>
        <ReactCSSTransitionGroup transitionName='playlistbartransition'
                                 transitionEnterTimeout={2000}
                                 transitionLeaveTimeout={1000}>
          {settingsBar}
        </ReactCSSTransitionGroup>
      </span>
    )
  }
}

