import React from 'react'

import { MODAL_DATA_VALUE } from 'waves-client-constants'

export default class Modal extends React.PureComponent {
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
    const { title, disabled, actionTitle, deleteTitle, children } = this.props
    return (
      <div className='fixed-full-page modal'>
        <div className='modal-dialog'>
          <div className='modal-content' data-toggle={MODAL_DATA_VALUE}>
            <div className='modal-header'>
              <button
                type='button'
                className='modal-close'
                onClick={this.onClose}
              >
                <span>&times;</span>
              </button>
              <h4 className='modal-title'>{title}</h4>
            </div>
            <div className='modal-body'>{children}</div>
            <ModalFooter
              disabled={disabled}
              actionTitle={actionTitle}
              onAction={this.onAction}
              deleteTitle={deleteTitle}
              onDelete={this.onDelete}
              onClose={this.onClose}
            />
          </div>
        </div>
      </div>
    )
  }
}

class ModalFooter extends React.PureComponent {
  render() {
    const { deleteTitle, onDelete, actionTitle, onAction, onClose, disabled } =
      this.props
    return (
      <div className='modal-footer'>
        <button
          type='button'
          disabled={disabled}
          className='btn btn-dropdown pull-right'
          onClick={onClose}
        >
          Close
        </button>

        {deleteTitle && onDelete && (
          <button
            type='button'
            disabled={disabled}
            className='btn btn-delete'
            style={{ float: actionTitle && onAction ? 'left' : 'right' }}
            onClick={onDelete}
          >
            {deleteTitle}
          </button>
        )}

        {actionTitle && onAction && (
          <button
            type='button'
            disabled={disabled}
            className='btn btn-primary pull-right'
            onClick={onAction}
          >
            {actionTitle}
          </button>
        )}
        <div className='clearfix' />
      </div>
    )
  }
}

export class ModalInput extends React.PureComponent {
  render() {
    const { label, value, placeholder, onChange, ...rest } = this.props
    return (
      <Modal {...rest}>
        <div className='modal-input-container'>
          <label className='modal-input-label'>{label}</label>
          <div className='modal-input'>
            <input
              className='form-input'
              value={value}
              placeholder={placeholder}
              onChange={onChange}
            />
          </div>
          <div className='clearfix' />
        </div>
      </Modal>
    )
  }
}
