import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import {
  NOW_PLAYING_NAME,
  LIBRARY_NAME,
  UPLOADS_NAME,
  contextmenuTypes,
  modalTypes
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

  tracksRemove = async () => {
    const { actions, playlistName } = this.props
    try {
      await actions.tracksRemove(playlistName)
    } catch (err) {
      actions.toastErr(`${err}`)
    }
  }

  nowPlayingAdd = () => {
    const { actions, playlistName } = this.props
    actions.playlistAdd(playlistName, NOW_PLAYING_NAME)
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
    if (playlistName === LIBRARY_NAME) {
      return <LibraryDelete onClick={this.tracksDelete} />
    }
    if (playlistName === UPLOADS_NAME) {
      return <PlaylistRemove onClick={actions.trackUploadsDelete} />
    }
    return <PlaylistRemove onClick={this.tracksRemove} />
  }

  render() {
    const { actions, bulk, playlistName } = this.props
    return (
      <React.Fragment>
        {!bulk && this.getPlayOrPauseAction()}

        {playlistName !== NOW_PLAYING_NAME && playlistName !== UPLOADS_NAME && (
          <NowPlayingAdd onClick={this.nowPlayingAdd} />
        )}

        {playlistName !== UPLOADS_NAME && (
          <PlaylistAdd onClick={this.playlistAdd} />
        )}

        {!bulk && playlistName !== UPLOADS_NAME && (
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
