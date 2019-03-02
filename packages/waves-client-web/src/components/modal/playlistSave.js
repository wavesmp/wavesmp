import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { DEFAULT_PLAYLIST, toastTypes } from 'waves-client-constants'

import { ModalHeader, ModalFooter, ModalWrapper } from './util'
import { isPlaylistNameValid } from '../../util'

const TITLE = 'Save Playlist'
const ACTION = 'Save'

class SavePlaylistModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = { playlistSaveName: '' }
  }

  onClose = () => {
    const { actions } = this.props
    actions.modalSet(null)
  }

  onInput = ev => {
    const playlistSaveName = ev.currentTarget.value
    this.setState({ playlistSaveName })
  }

  onAction = () => {
    const { actions } = this.props
    const { playlistSaveName } = this.state
    if (!isPlaylistNameValid(playlistSaveName)) {
      actions.toastAdd({ type: toastTypes.Error, msg: 'Invalid playlist name' })
      return
    }
    actions.playlistCopy(DEFAULT_PLAYLIST, playlistSaveName)
    actions.toastAdd({ type: toastTypes.Success, msg: 'Saved playlist' })
    this.onClose()
  }

  render() {
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
        />
      </ModalWrapper>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SavePlaylistModal)
