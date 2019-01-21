import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import constants from 'waves-client-constants'

import { ModalHeader, ModalFooter, ModalWrapper } from './util'

const TITLE = 'Playlist Settings'
const ACTION = 'Save'

class PlaylistSettingsModal extends React.Component {
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
    /* TODO better validation */
    if (playlistSaveName === '') {
      toastr.error('Invalid playlist name')
      return
    }
    const { actions, playlists, playlistName, history } = this.props
    actions.playlistMove(playlistName, playlistSaveName)
    const { search } = playlists[playlistName]
    const to = {pathname: `/playlist/${playlistSaveName}`, search}
    history.push(to)
    toastr.success('Renamed playlist')
    this.onClose()
  }

  onDelete = () => {
    const { actions, playlists, playlistName, history } = this.props
    actions.playlistDelete(playlistName)
    const { search } = playlists[constants.DEFAULT_PLAYLIST]
    const to = {pathname: '/', search}
    history.push(to)
    toastr.success('Deleted playlist')
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
        <ModalHeader title={TITLE} onClose={this.onClose}/>

          <div className='modal-body'>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <label style={{marginLeft: '15px', marginRight: '25px'}}>Name</label>
              <div style={{width: '100%', marginRight: '15px'}}>
                <input className='form-input' value={playlistSaveName}
                       placeholder={playlistName} onInput={this.onInput}/>
              </div>
              <div className='clearfix'/>
            </div>
          </div>

        <ModalFooter
          actionTitle={ACTION}
          onAction={this.onAction}
          onClose={this.onClose}
          deleteTitle='Delete'
          onDelete={this.onDelete}/>
      </ModalWrapper>
    )
  }
}

function mapStateToProps(state) {
  return {
    playlists: state.tracks.playlists,
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