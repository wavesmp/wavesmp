import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { toastTypes } from 'waves-client-constants'

import { ModalInput } from './util'

const TITLE = 'Create Playlist'
const ACTION = 'Create'

class CreatePlaylistModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { name: '' }
  }

  onChange = ev => {
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
      return false
    }
    actions.toastAdd({ type: toastTypes.Success, msg: 'Created playlist' })
    return true
  }

  render() {
    const { name } = this.state
    const { actions } = this.props
    return (
      <ModalInput
        actions={actions}
        title={TITLE}
        actionTitle={ACTION}
        onAction={this.onAction}
        label='Name'
        value={name}
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
)(CreatePlaylistModal)
