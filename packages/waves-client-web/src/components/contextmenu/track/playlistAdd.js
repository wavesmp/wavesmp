import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'

import { Back, PlaylistAddItem } from './items'
import { isInternalPlaylist } from '../../../util'

class PlaylistAdd extends React.PureComponent {
  onBackClick = ev => {
    const { actions } = this.props
    actions.contextmenuBack()
    ev.preventDefault()
    ev.stopPropagation()
  }

  onPlaylistAdd = playlist => {
    const { actions, currentPlaylist } = this.props
    actions.playlistAdd(currentPlaylist, playlist)
  }

  getPlaylistAddItems() {
    const { playlists } = this.props
    const items = []

    for (const playlist in playlists) {
      if (isInternalPlaylist(playlist)) {
        continue
      }
      items.push(
        <PlaylistAddItem
          key={playlist}
          name={playlist}
          onPlaylistAdd={this.onPlaylistAdd}
        />
      )
    }

    return items
  }

  render() {
    return (
      <React.Fragment>
        <Back onClick={this.onBackClick} />
        {this.getPlaylistAddItems()}
      </React.Fragment>
    )
  }
}

function mapStateToProps(state) {
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
