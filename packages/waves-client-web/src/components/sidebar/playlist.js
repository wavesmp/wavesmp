import React from 'react'
import { Link } from 'react-router-dom'

import constants from 'waves-client-constants'

export default class PlaylistBar extends React.Component {
  componentDidMount() {
    const { actions } = this.props
    $(document).ready( () => {
      console.log('SETTING DROPPABLE')
      $('.sidebar-playlist').droppable({
        drop: (ev, ui) => {
          const playlistName = ev.target.getAttribute(constants.PLAYLIST_NAME_ATTR)
          if (playlistName === '__new') {
            console.log('TODO IMPLEMNTE ME')
            return
          }
          console.log('TODO IMPLEMNTE ME')

          // TODO old implementation
          // We no longer pass selection since it's in state.
          // However, we don't know the playlistName
          // (unless we parse the router.. yuck)
          // perhaps include in in element?
          //
          // // for some reason, map won't work here
          // let selected = ui.helper.children()
          // let len = selected.length
          // let i
          // let item
          // let selection = {}
          // let playId
          // let trackId
          // for (i = 0; i < len; i += 1) {
          //   item = selected[i]
          //   playId = item.getAttribute(constants.PLAY_INDEX_ATTR)
          //   trackId = item.getAttribute(constants.TRACK_ID_ATTR)
          //   selection[playId] = trackId
          // }
          // actions.playlistAdd(playlistName, selection)
        },
        tolerance: 'pointer',
        over: (ev, ui) => {
          $( 'body' ).css('cursor', 'copy')
        },
        out: (ev, ui) => {
          $( 'body' ).css('cursor', 'move')
        }
      });
    })
  }

  onBackClick = () => {
    const { actions } = this.props
    actions.sidebarModeSet('main')
  }

  onNewPlaylistClick = () => {
    // TODO implment me
    console.log('NOT YET IMPLEMENTED')
    // const { actions } = this.props
    // actions.modalSet({type: constants.modalTypes.PLAYLIST_ADD})
  }

  render() {
    const { playlists, isPlayerVisible } = this.props
    const playlistObjs = Object.values(playlists).filter(
      p => (p.name !== constants.DEFAULT_PLAYLIST &&
            p.name !== constants.FULL_PLAYLIST &&
            p.name !== constants.UPLOAD_PLAYLIST)
    )
    // TODO FIXME Proper new playlist button
    // TODO FIXME should only show when dragging as a signal
    let className = 'sidebar-container-wide'
    if (isPlayerVisible) {
      className += ' sidebar-container-player-visible'
    }
    return (
      <div id='sidebar-container' className={className}>
        <ul className='nav'>
          <li>
            <span onClick={this.onBackClick}>
              <i className='fa-fw fa fa-lg fa-arrow-left'></i>
              <span style={{padding: '0px 15px'}}>Back</span>
            </span>
          </li>
          <li className='sidebar-playlist' data-playlistname={'__new'}>
            <span onClick={this.onNewPlaylistClick}>
              <i className='fa-fw fa fa-lg fa-plus'></i>
              <span>New Playlist</span>
            </span>
          </li>
          {playlistObjs.map(playlist => (
            <li key={playlist.name} className='sidebar-playlist'
                data-playlistname={playlist.name}>
              <Link to={{pathname: `/playlist/${playlist.name}`,
                         search: playlist.search}}>
                <i className='fa-fw fa fa-lg fa-list'></i>
                <span>{playlist.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

