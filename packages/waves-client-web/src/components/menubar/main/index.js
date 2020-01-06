import React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'

import { menuTypes, routes } from 'waves-client-constants'

import './index.css'
import TrackPlayer from './trackplayer'
import TrackSlider from './trackslider'
import LogoSvg from '../common/logo-wide.svg'

let prevPlayerVisible = false

export default class MenuBar extends React.PureComponent {
  onNotificationsClick = ev => {
    const { actions } = this.props
    actions.menuSetElem({ ev, type: menuTypes.NOTIFICATIONS })
  }

  onUserSettingsClick = ev => {
    const { actions, history } = this.props
    actions.menuSetElem({
      ev,
      type: menuTypes.USER_SETTINGS,
      props: { history }
    })
  }

  render() {
    const {
      actions,
      playing,
      layout,
      menubar,
      filteredSelection,
      index,
      playlistName
    } = this.props

    let trackSlider = null
    let trackPlayer = null
    let logoClassName = 'menubar-main-logo'
    let logoNameClassName = 'menubar-main-logo-name'
    const isSliderVisible = playing.track != null
    const isPlayerVisible = isSliderVisible || menubar
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
    } else {
      prevPlayerVisible = false
    }

    if (isSliderVisible) {
      trackSlider = <TrackSlider key={0} actions={actions} playing={playing} />
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
        <i
          className='fa fa-lg fa-globe menubar-dropdown-icon'
          onClick={this.onNotificationsClick}
        />
        <i
          className='fa fa-lg fa-user menubar-dropdown-icon'
          onClick={this.onUserSettingsClick}
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
