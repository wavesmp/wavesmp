import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { NOW_PLAYING_NAME } from 'waves-client-constants'

import { ModalInput } from './util'
import { isPlaylistNameValid } from '../../util'

const TITLE = 'Save Playlist'
const ACTION = 'Save'

class SavePlaylistModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { playlistSaveName: '' }
  }

  onChange = ev => {
    const playlistSaveName = ev.currentTarget.value
    this.setState({ playlistSaveName })
  }

  onAction = async () => {
    const { actions } = this.props
    const { playlistSaveName } = this.state
    if (!isPlaylistNameValid(playlistSaveName)) {
      actions.toastErr('Invalid playlist name')
      return false
    }
    try {
      await actions.playlistCopy(NOW_PLAYING_NAME, playlistSaveName)
    } catch (err) {
      actions.toastErr(`${err}`)
      return false
    }
    actions.toastSuccess('Saved playlist')
    return true
  }

  render() {
    const { playlistSaveName } = this.state
    const { actions } = this.props
    return (
      <ModalInput
        actions={actions}
        title={TITLE}
        actionTitle={ACTION}
        onAction={this.onAction}
        label='Name'
        value={playlistSaveName}
        onChange={this.onChange}
      />
    )
  }
}

function mapStateToProps() {
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
