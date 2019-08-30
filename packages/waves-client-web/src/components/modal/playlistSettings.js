import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { NOW_PLAYING_NAME, toastTypes, routes } from 'waves-client-constants'

import { ModalInput } from './util'
import { isPlaylistNameValid } from '../../util'

const TITLE = 'Playlist Settings'
const ACTION = 'Save'

class PlaylistSettingsModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { playlistSaveName: '' }
  }

  onChange = ev => {
    const playlistSaveName = ev.currentTarget.value
    this.setState({ playlistSaveName })
  }

  onAction = async () => {
    const { playlistSaveName } = this.state
    const { actions, playlists, playlistName, history } = this.props
    if (!isPlaylistNameValid(playlistSaveName)) {
      actions.toastAdd({ type: toastTypes.Error, msg: 'Invalid playlist name' })
      return false
    }
    try {
      await actions.playlistMove(playlistName, playlistSaveName)
    } catch (err) {
      actions.toastAdd({ type: toastTypes.Error, msg: err.toString() })
      return false
    }
    const { search } = playlists[playlistName]
    const to = { pathname: `/playlist/${playlistSaveName}`, search }
    history.push(to)
    actions.toastAdd({ type: toastTypes.Success, msg: 'Renamed playlist' })
    return true
  }

  onDelete = async () => {
    const { actions, playlists, playlistName, history } = this.props
    try {
      await actions.playlistDelete(playlistName)
    } catch (err) {
      actions.toastAdd({ type: toastTypes.Error, msg: err.toString() })
      return false
    }
    const { search } = playlists[NOW_PLAYING_NAME]
    const to = { pathname: routes.defaultRoute, search }
    history.push(to)
    actions.toastAdd({ type: toastTypes.Success, msg: 'Deleted playlist' })
    return true
  }

  render() {
    const { actions, playlistName } = this.props
    const { playlistSaveName } = this.state
    return (
      <ModalInput
        actions={actions}
        title={TITLE}
        actionTitle={ACTION}
        onAction={this.onAction}
        deleteTitle='Delete'
        onDelete={this.onDelete}
        label='Name'
        value={playlistSaveName}
        placeholder={playlistName}
        onChange={this.onChange}
      />
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
)(PlaylistSettingsModal)
