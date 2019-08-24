import React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'

import { routes } from 'waves-client-constants'

import './index.css'
import Notifications from './notifications'
import TrackPlayer from './trackplayer'
import TrackSlider from './trackslider'
import UserSettings from './userSettings'
import LogoSvg from '../common/logo-wide.svg'

let prevPlayerVisible = false

export default class MenuBar extends React.PureComponent {
  render() {
    const {
      actions,
      dropdown,
      playing,
      history,
      userName,
      layout,
      menubar,
      filteredSelection,
      index,
      playlistName
    } = this.props
    const { isPlaying, track } = playing

    let trackSlider = null
    let trackPlayer = null
    let isPlayerVisible = track !== null
    let logoClassName = 'menubar-main-logo'
    let logoNameClassName = 'menubar-main-logo-name'
    if (isPlayerVisible) {
      /* Usually, transitions are enabled when the player is visible.
       * However, disable the transition when player is becoming visible
       * and the user is on a small screen. Adding a new transition
       * for this case would conflict with the current one, so handle
       * it programmatically (no pure-CSS solution available AFAIK). */
      if (!prevPlayerVisible && layout === 0) {
        setTimeout(() => this.forceUpdate(), 0)
      } else {
        logoClassName += ' menubar-transition'
        logoNameClassName += ' menubar-transition'
      }

      prevPlayerVisible = true
      logoClassName += ' menubar-player-visible'
      logoNameClassName += ' menubar-player-visible'
      trackSlider = <TrackSlider actions={actions} playing={playing} key={0} />
      trackPlayer = (
        <TrackPlayer
          key={0}
          actions={actions}
          menubar={menubar}
          index={index}
          filteredSelection={filteredSelection}
          playlistName={playlistName}
          playing={playing}
        />
      )
    }

    return (
      <header className='menubar-main-header'>
        <Link to={routes.defaultRoute}>
          <LogoSvg className={logoClassName} />
          <span className={logoNameClassName}>WAVES</span>
        </Link>
        <CSSTransitionGroup
          transitionName='fade'
          transitionEnterTimeout={800}
          transitionLeaveTimeout={300}
        >
          {trackPlayer}
        </CSSTransitionGroup>
        <Notifications actions={actions} dropdown={dropdown} />
        <UserSettings
          actions={actions}
          dropdown={dropdown}
          history={history}
          userName={userName}
        />
        <CSSTransitionGroup
          component='div'
          transitionName='fade'
          transitionEnterTimeout={800}
          transitionLeaveTimeout={300}
        >
          {trackSlider}
        </CSSTransitionGroup>
      </header>
    )
  }
}
