import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import constants from 'waves-client-constants'

import { Back, PlaylistAddItem } from './items'

class PlaylistAdd extends React.Component {
  onBackClick = ev => {
    const { actions } = this.props
    actions.contextmenuBack()
    ev.preventDefault()
    ev.stopPropagation()
  }

  getPlaylistAddItems() {
    const { actions, playlists, currentPlaylist } = this.props
    const items = []

    for (const playlist in playlists) {
      if (playlist === constants.DEFAULT_PLAYLIST ||
          playlist === constants.FULL_PLAYLIST) {
        continue
      }
      items.push(<PlaylistAddItem key={playlist} title={playlist} onClick={
        ev => actions.playlistAdd(currentPlaylist, playlist)
      }/>)
    }

    return items
  }

  render() {
    return (
      <ul className='contextmenu-items'>
        <Back onClick={this.onBackClick}/>
        {this.getPlaylistAddItems()}
      </ul>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    playlists: state.tracks.playlists
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaylistAdd)
