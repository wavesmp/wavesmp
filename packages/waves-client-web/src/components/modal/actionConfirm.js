import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'

import { ModalHeader, ModalFooter, ModalWrapper } from './util'

class ActionConfirmModal extends React.Component {
  onClose = () => {
    const { actions } = this.props
    actions.modalSet(null)
  }

  onAction = async () => {
    const { onAction } = this.props
    if (await onAction()) {
      this.onClose()
    }
  }

  onDelete = async () => {
    const { onDelete } = this.props
    if (await onDelete()) {
      this.onClose()
    }
  }

  render() {
    const {
      deleteTitle,
      actionTitle,
      message,
      title,
      additionalRow,
      disabled
    } = this.props
    return (
      <ModalWrapper>
        <ModalHeader title={title} onClose={this.onClose} />
        <div className='modal-body'>
          <div>
            <span style={{ marginTop: '6px' }}>{message}</span>
          </div>
          {additionalRow}
        </div>

        <ModalFooter
          disabled={disabled}
          actionTitle={actionTitle}
          onAction={this.onAction}
          deleteTitle={deleteTitle}
          onDelete={this.onDelete}
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
)(ActionConfirmModal)
