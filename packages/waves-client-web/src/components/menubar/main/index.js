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
    const { actions, dropdown, playing, history, userName } = this.props
    const { isPlaying, track } = playing

    let trackSlider = null
    let trackPlayer = null
    let isPlayerVisible = track !== null
    let logoClassName = 'menubar-main-logo'
    let logoNameClassName = 'menubar-main-logo-name'
    if (isPlayerVisible) {
      /* Avoid transition when trackplayer takes entire space. */
      if (
        !prevPlayerVisible &&
        !window.matchMedia('only screen and (min-width: 516px)').matches
      ) {
        setTimeout(() => this.forceUpdate(), 0)
      } else {
        logoClassName += ' menubar-transition'
        logoNameClassName += ' menubar-transition'
      }

      prevPlayerVisible = true
      logoClassName += ' menubar-player-visible'
      logoNameClassName += ' menubar-player-visible'
      trackSlider = <TrackSlider actions={actions} playing={playing} key={0} />
      trackPlayer = <TrackPlayer actions={actions} playing={playing} key={0} />
    }

    return (
      <header className='menubar-main-header'>
        <div className='menubar-main-container'>
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
        </div>
        <CSSTransitionGroup
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
