import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { DEFAULT_PLAYLIST, toastTypes, routes } from 'waves-client-constants'

import { ModalHeader, ModalFooter, ModalWrapper } from './util'
import { isPlaylistNameValid } from '../../util'

const TITLE = 'Playlist Settings'
const ACTION = 'Save'

class PlaylistSettingsModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { playlistSaveName: '' }
  }

  onInput = ev => {
    const playlistSaveName = ev.currentTarget.value
    this.setState({ playlistSaveName })
  }

  onAction = () => {
    const { playlistSaveName } = this.state
    const { actions, playlists, playlistName, history } = this.props
    if (!isPlaylistNameValid(playlistSaveName)) {
      actions.toastAdd({ type: toastTypes.Error, msg: 'Invalid playlist name' })
      return
    }
    actions.playlistMove(playlistName, playlistSaveName)
    const { search } = playlists[playlistName]
    const to = { pathname: `/playlist/${playlistSaveName}`, search }
    history.push(to)
    actions.toastAdd({ type: toastTypes.Success, msg: 'Renamed playlist' })
    this.onClose()
  }

  onDelete = () => {
    const { actions, playlists, playlistName, history } = this.props
    actions.playlistDelete(playlistName)
    const { search } = playlists[DEFAULT_PLAYLIST]
    const to = { pathname: routes.defaultRoute, search }
    history.push(to)
    actions.toastAdd({ type: toastTypes.Success, msg: 'Deleted playlist' })
    this.onClose()
  }

  onClose = () => {
    const { actions } = this.props
    actions.modalSet(null)
  }

  render() {
    const { playlistName } = this.props
    const { playlistSaveName } = this.state
    return (
      <ModalWrapper>
        <ModalHeader title={TITLE} onClose={this.onClose} />

        <div className='modal-body'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginLeft: '15px', marginRight: '25px' }}>
              Name
            </label>
            <div style={{ width: '100%', marginRight: '15px' }}>
              <input
                className='form-input'
                value={playlistSaveName}
                placeholder={playlistName}
                onInput={this.onInput}
              />
            </div>
            <div className='clearfix' />
          </div>
        </div>

        <ModalFooter
          actionTitle={ACTION}
          onAction={this.onAction}
          onClose={this.onClose}
          deleteTitle='Delete'
          onDelete={this.onDelete}
        />
      </ModalWrapper>
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
