import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import constants from 'waves-client-constants'

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
  getPlayOrPauseAction() {
    const {
      actions,
      playlistName,
      isPlaying,
      index,
      itemIndex,
      trackId
    } = this.props

    if (index === itemIndex && isPlaying) {
      return <Pause onClick={actions.pause} />
    }

    if (index === itemIndex) {
      return <PlayResume onClick={actions.play} />
    }
    return (
      <Play
        onClick={ev => {
          actions.trackToggle(trackId, playlistName, itemIndex)
        }}
      />
    )
  }

  getRemoveAction() {
    const { actions, trackId, bulk, playlistName } = this.props
    if (playlistName === constants.FULL_PLAYLIST) {
      return (
        <LibraryDelete
          onClick={ev => {
            actions.modalSet({ type: constants.modalTypes.TRACKS_DELETE })
          }}
        />
      )
    }
    if (playlistName === constants.UPLOAD_PLAYLIST) {
      return <PlaylistRemove onClick={actions.trackUploadsDelete} />
    }
    return (
      <PlaylistRemove
        onClick={ev => {
          actions.tracksRemove(playlistName)
        }}
      />
    )
  }

  render() {
    const { actions, trackId, bulk, playlistName } = this.props
    return (
      <React.Fragment>
        {!bulk && this.getPlayOrPauseAction()}

        {playlistName !== constants.DEFAULT_PLAYLIST &&
          playlistName !== constants.UPLOAD_PLAYLIST && (
            <NowPlayingAdd
              onClick={ev => {
                actions.playlistAdd(playlistName, constants.DEFAULT_PLAYLIST)
              }}
            />
          )}

        {playlistName !== constants.UPLOAD_PLAYLIST && (
          <PlaylistAdd
            onClick={ev => {
              actions.contextmenuNext({
                type: constants.contextmenuTypes.PLAYLIST_ADD,
                props: {
                  currentPlaylist: playlistName
                }
              })
              ev.preventDefault()
              ev.stopPropagation()
            }}
          />
        )}

        {!bulk && playlistName !== constants.UPLOAD_PLAYLIST && (
          <Download onClick={ev => actions.download(trackId)} />
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
  return {
    isPlaying
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
)(Track)
