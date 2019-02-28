import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { toastTypes } from 'waves-client-constants'

import { ModalHeader, ModalFooter, ModalWrapper } from './util'

const TITLE = 'Create Playlist'
const ACTION = 'Create'

class CreatePlaylistModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = { name: '' }
  }

  onClose = () => {
    const { actions } = this.props
    actions.modalSet(null)
  }

  onInput = ev => {
    const name = ev.currentTarget.value
    this.setState({ name })
  }

  onAction = async () => {
    const { actions } = this.props
    const { name } = this.state
    try {
      await actions.playlistCreate(name)
    } catch (err) {
      actions.toastAdd({ type: toastTypes.Error, msg: err.message })
      console.log(`Error creating playlist: ${err}`)
      return
    }
    actions.toastAdd({ type: toastTypes.Success, msg: 'Created playlist' })
    this.onClose()
  }

  render() {
    const { name } = this.state
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
                value={name}
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
)(CreatePlaylistModal)
