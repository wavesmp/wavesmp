import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { getFilteredSelection } from 'waves-client-selectors'

import { ModalInput } from './util'

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
    const { actions, numItems, playlistSrc } = this.props
    const { name } = this.state
    if (numItems) {
      actions.playlistAdd(playlistSrc, name)
      return true
    }
    try {
      await actions.playlistCreate(name)
    } catch (err) {
      actions.toastErr(`${err}`)
      console.log(`Error creating playlist: ${err}`)
      return false
    }
    actions.toastSuccess('Created playlist')
    return true
  }

  getTitle() {
    const { numItems } = this.props
    if (numItems) {
      const plurality = numItems === 1 ? '' : 's'
      return `Create Playlist with ${numItems} track${plurality}`
    }
    return 'Create Playlist'
  }

  render() {
    const { name } = this.state
    const { actions } = this.props
    const title = this.getTitle()
    return (
      <ModalInput
        actions={actions}
        title={title}
        actionTitle='Create'
        onAction={this.onAction}
        label='Name'
        value={name}
        onChange={this.onChange}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { playlistSrc } = ownProps
  if (playlistSrc) {
    const numItems = getFilteredSelection(state, playlistSrc).size
    return { numItems }
  }
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
)(CreatePlaylistModal)
