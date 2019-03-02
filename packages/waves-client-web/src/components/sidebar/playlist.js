import React from 'react'
import { Link } from 'react-router-dom'

import constants from 'waves-client-constants'

export default class PlaylistBar extends React.PureComponent {
  onBackClick = () => {
    const { actions } = this.props
    actions.sidebarModeSet('main')
  }

  onDragOver(ev) {
    if (ev.dataTransfer.types.includes(constants.PLAYLIST_TYPE)) {
      ev.preventDefault()
    }
  }

  onNewPlaylistClick = () => {
    const { actions } = this.props
    actions.modalSet({ type: constants.modalTypes.PLAYLIST_CREATE })
  }

  onNewPlaylistDrop = ev => {
    const { actions } = this.props
    const playlistName = ev.dataTransfer.getData(constants.PLAYLIST_TYPE)
    if (playlistName) {
      ev.preventDefault()
      console.log(`TODO implement me. Dropped to new playlist: ${playlistName}`)
      // actions.modalSet({type: constants.modalTypes.PLAYLIST_CREATE_FROM})
    }
  }

  onPlaylistDrop = ev => {
    const playlistName = ev.dataTransfer.getData(constants.PLAYLIST_TYPE)
    if (playlistName) {
      ev.preventDefault()
      console.log(
        `TODO implement me. Dropped to existing playlist: ${playlistName}`
      )
      // actions.playlistAdd(...)
    }
  }

  render() {
    const { playlists, isPlayerVisible } = this.props
    const playlistObjs = Object.values(playlists).filter(
      p =>
        p.name !== constants.DEFAULT_PLAYLIST &&
        p.name !== constants.FULL_PLAYLIST &&
        p.name !== constants.UPLOAD_PLAYLIST
    )
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
              <span style={{ padding: '0px 15px' }}>Back</span>
            </span>
          </li>
          <li className='sidebar-playlist' data-playlistname={'__new'}>
            <span
              onClick={this.onNewPlaylistClick}
              onDragOver={this.onDragOver}
              onDrop={this.onNewPlaylistDrop}
            >
              <i className='fa-fw fa fa-lg fa-plus' />
              <span>New Playlist</span>
            </span>
          </li>
          {playlistObjs.map(playlist => (
            <li
              key={playlist.name}
              className='sidebar-playlist'
              data-playlistname={playlist.name}
            >
              <Link
                to={{
                  pathname: `/playlist/${playlist.name}`,
                  search: playlist.search
                }}
                onDragOver={this.onDragOver}
                onDrop={this.onPlaylistDrop}
              >
                <i className='fa-fw fa fa-lg fa-list' />
                <span>{playlist.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
