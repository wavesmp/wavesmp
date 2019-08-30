import React from 'react'
import { Link } from 'react-router-dom'

import constants from 'waves-client-constants'

export default class MainBar extends React.PureComponent {
  onPlaylistClick = () => {
    const { actions } = this.props
    actions.sidebarSet(true)
  }

  render() {
    const { pathname, playlists, isSliderVisible } = this.props
    let className = 'sidebar-container-narrow'
    if (isSliderVisible) {
      className += ' sidebar-container-player-visible'
    }

    const menuBarItems = [
      {
        name: 'Now Playing',
        pathname: constants.routes.nowplaying,
        playlistName: constants.NOW_PLAYING_NAME,
        className: 'fa-fw fa fa-lg fa-headphones'
      },
      {
        name: 'Library',
        pathname: constants.routes.library,
        playlistName: constants.LIBRARY_NAME,
        className: 'fa-fw fa fa-lg fa-book'
      }
    ]
    return (
      <div id='sidebar-container' className={className}>
        <ul className='nav'>
          {menuBarItems.map(sample => (
            <PlaylistLink
              key={sample.name}
              itemPathname={sample.pathname}
              playlist={playlists && playlists[sample.playlistName]}
              className={sample.className}
              pathname={pathname}
            />
          ))}
          <li>
            <span onClick={this.onPlaylistClick}>
              <i className='fa-fw fa fa-lg fa-list' />
            </span>
          </li>
          <li>
            <Link
              className={
                pathname === constants.routes.upload ? 'sidebar-active' : ''
              }
              to={constants.routes.upload}
            >
              <i className='fa-fw fa fa-lg fa-cloud-upload' />
            </Link>
          </li>
          <li>
            <Link
              className={
                pathname === constants.routes.settings ? 'sidebar-active' : ''
              }
              to={constants.routes.settings}
            >
              <i className='fa-fw fa fa-lg fa-cog' />
            </Link>
          </li>
        </ul>
      </div>
    )
  }
}

class PlaylistLink extends React.PureComponent {
  render() {
    const { itemPathname, playlist, pathname, className } = this.props
    const activeClassName = pathname === itemPathname ? 'sidebar-active' : ''
    const search = playlist && playlist.search ? playlist.search : ''
    const to = { pathname: itemPathname, search }
    return (
      <li>
        <Link className={activeClassName} to={to}>
          <i className={className} />
        </Link>
      </li>
    )
  }
}
