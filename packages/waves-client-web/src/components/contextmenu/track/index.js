import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  UPLOAD_PLAYLIST,
  contextmenuTypes,
  modalTypes,
  toastTypes
} from 'waves-client-constants'

import {
  NowPlayingAdd,
  PlayResume,
  Pause,
  Play,
  PlaylistAdd,
  PlaylistRemove,
  Download,
  LibraryDelete
} from './items'

class Track extends React.PureComponent {
  trackToggle = () => {
    const { actions, playlistName, itemIndex, trackId } = this.props
    actions.trackToggle(trackId, playlistName, itemIndex)
  }

  tracksDelete = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.TRACKS_DELETE })
  }

  tracksRemove = () => {
    const { actions, playlistName } = this.props
    actions.tracksRemove(playlistName)
  }

  nowPlayingAdd = () => {
    const { actions, playlistName } = this.props
    actions.playlistAdd(playlistName, DEFAULT_PLAYLIST)
  }

  playlistAdd = ev => {
    const { actions, playlistName } = this.props
    actions.contextmenuNext({
      type: contextmenuTypes.PLAYLIST_ADD,
      props: { currentPlaylist: playlistName }
    })
    ev.preventDefault()
    ev.stopPropagation()
  }

  download = () => {
    const { actions, trackId } = this.props
    actions.download(trackId)
  }

  getPlayOrPauseAction() {
    const { actions, isPlaying, index, itemIndex } = this.props
    if (index === itemIndex) {
      if (isPlaying) {
        return <Pause onClick={actions.pause} />
      }
      return <PlayResume onClick={actions.play} />
    }
    return <Play onClick={this.trackToggle} />
  }

  getRemoveAction() {
    const { actions, playlistName } = this.props
    if (playlistName === FULL_PLAYLIST) {
      return <LibraryDelete onClick={this.tracksDelete} />
    }
    if (playlistName === UPLOAD_PLAYLIST) {
      return <PlaylistRemove onClick={actions.trackUploadsDelete} />
    }
    return <PlaylistRemove onClick={this.tracksRemove} />
  }

  render() {
    const { actions, bulk, playlistName } = this.props
    return (
      <React.Fragment>
        {!bulk && this.getPlayOrPauseAction()}

        {playlistName !== DEFAULT_PLAYLIST &&
          playlistName !== UPLOAD_PLAYLIST && (
            <NowPlayingAdd onClick={this.nowPlayingAdd} />
          )}

        {playlistName !== UPLOAD_PLAYLIST && (
          <PlaylistAdd onClick={this.playlistAdd} />
        )}

        {!bulk && playlistName !== UPLOAD_PLAYLIST && (
          <Download onClick={this.download} />
        )}

        {this.getRemoveAction()}
      </React.Fragment>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { tracks } = state
  const { playing } = tracks
  const { isPlaying } = playing
  return { isPlaying }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Track)
