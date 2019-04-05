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
      return <Pause onClick={actions.playPauseButtonToggle} />
    }

    if (index === itemIndex) {
      return <PlayResume onClick={actions.playPauseButtonToggle} />
    }
    return (
      <Play
        onClick={ev => {
          actions.trackToggle(trackId, playlistName, itemIndex)
        }}
      />
    )
  }

  render() {
    const { actions, trackId, bulk, playlistName } = this.props
    return (
      <React.Fragment>
        {!bulk && this.getPlayOrPauseAction()}

        {playlistName !== constants.DEFAULT_PLAYLIST && (
          <NowPlayingAdd
            onClick={ev => {
              actions.playlistAdd(playlistName, constants.DEFAULT_PLAYLIST)
            }}
          />
        )}

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

        {!bulk && <Download onClick={ev => actions.download(trackId)} />}

        {playlistName !== constants.FULL_PLAYLIST && (
          <PlaylistRemove
            onClick={ev => {
              actions.tracksRemove(playlistName)
            }}
          />
        )}

        {playlistName === constants.FULL_PLAYLIST && (
          <LibraryDelete
            onClick={ev => {
              actions.modalSet({ type: constants.modalTypes.TRACKS_DELETE })
            }}
          />
        )}
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
