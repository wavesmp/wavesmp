import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import {
  NOW_PLAYING_NAME,
  LIBRARY_NAME,
  UPLOADS_NAME,
  menuTypes,
  modalTypes
} from 'waves-client-constants'

import './index.css'

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
    actions.menuReset()
  }

  pause = () => {
    const { actions } = this.props
    actions.pause()
    actions.menuReset()
  }

  play = () => {
    const { actions } = this.props
    actions.play()
    actions.menuReset()
  }

  tracksDelete = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.TRACKS_DELETE })
    actions.menuReset()
  }

  tracksRemove = async () => {
    const { actions, playlistName } = this.props
    try {
      await actions.tracksRemove(playlistName)
      actions.menuReset()
    } catch (err) {
      actions.toastErr(`${err}`)
    }
  }

  nowPlayingAdd = () => {
    const { actions, playlistName } = this.props
    actions.playlistAdd(playlistName, NOW_PLAYING_NAME)
    actions.menuReset()
  }

  playlistAdd = () => {
    const { actions, playlistName } = this.props
    actions.menuNext({
      type: menuTypes.PLAYLIST_ADD,
      props: { currentPlaylist: playlistName }
    })
  }

  download = () => {
    const { actions, trackId } = this.props
    actions.download(trackId)
    actions.menuReset()
  }

  getPlayOrPauseAction() {
    const { isPlaying, index, itemIndex } = this.props
    if (index === itemIndex) {
      if (isPlaying) {
        return <Pause onClick={this.pause} />
      }
      return <PlayResume onClick={this.play} />
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
    const { bulk, playlistName } = this.props
    return (
      <div className='menu-track'>
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
      </div>
    )
  }
}

function mapStateToProps(state) {
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

export default connect(mapStateToProps, mapDispatchToProps)(Track)
