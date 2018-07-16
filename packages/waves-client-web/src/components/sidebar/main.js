import React from 'react'
import { Link } from 'react-router-dom'

import constants from 'waves-client-constants'

export default class MainBar extends React.Component {
  onPlaylistClick = () => {
    const { actions } = this.props
    actions.sidebarModeSet('playlist')
  }

  onSettingsClick = () => {
    const { actions } = this.props
    actions.sidebarModeSet('settings')
  }

  render() {
    const { location, playlists, isPlayerVisible } = this.props
    let className = 'sidebar-container-narrow'
    if (isPlayerVisible) {
      className += ' sidebar-container-player-visible'
    }

    const menuBarItems = [
      {
         name: 'Now Playing',
         pathname: '/nowplaying',
         playlistName: constants.DEFAULT_PLAYLIST,
         className: 'fa-fw fa fa-lg fa-headphones'
      },
      {
        name: 'Library',
        pathname: '/library',
        playlistName: constants.FULL_PLAYLIST,
        className: 'fa-fw fa fa-lg fa-book'
      }
    ]
    return (
        <div id='sidebar-container' className={className}>
          <ul className='nav'>
            {menuBarItems.map(sample => (
              <PlaylistLink key={sample.name}
                           pathname={sample.pathname}
                           playlist={playlists && playlists[sample.playlistName]}
                           className={sample.className}
                           location={location}/>
              ))
            }
            <li>
              <span onClick={this.onPlaylistClick}>
                <i className='fa-fw fa fa-lg fa-list'></i>
              </span>
            </li>
            <li>
              <Link className={location.pathname === '/upload' ? 'sidebar-active' : ''}
                    to='/upload'>
                <i className='fa-fw fa fa-lg fa-cloud-upload'></i>
              </Link>
            </li>
            <li className='sidebar-profile-link'>
              <span onClick={this.onSettingsClick}>
                <i className='fa-fw fa fa-lg fa-cog'></i>
              </span>
            </li>
          </ul>
        </div>
    )
  }
}

class PlaylistLink extends React.Component {
  render() {
    const { pathname, playlist, location, className } = this.props
    const activeClassName = location.pathname === pathname ? 'sidebar-active' : ''
    const search = (playlist && playlist.search) ? playlist.search : ''

    return (
      <li>
        <Link className={activeClassName} to={{pathname, search}}>
          <i className={className}></i>
        </Link>
      </li>
    )
  }
}
