import React from 'react'

import { MODAL_DATA_VALUE } from 'waves-client-constants'

export class ModalWrapper extends React.Component {
  render() {
    const { children } = this.props
    return (
      <div className='fixed-full-page modal'>
        <div className='modal-dialog'>
          <div className='modal-content' data-toggle={MODAL_DATA_VALUE}>
            {children}
          </div>
        </div>
      </div>
    )
  }
}

export class ModalHeader extends React.Component {
  render() {
    const { title, onClose } = this.props
    return (
      <div className='modal-header'>
        <button type='button' className='modal-close' onClick={onClose}>
          <span>&times;</span>
        </button>
        <h4 className='modal-title'>{title}</h4>
      </div>
    )
  }
}

export class ModalFooter extends React.Component {
  render() {
    const { deleteTitle, onDelete, actionTitle, onAction, onClose, disabled } = this.props
    return (
      <div className='modal-footer'>
        <button
          type='button'
          disabled={disabled}
          className='btn btn-dropdown'
          onClick={onClose}
          style={{float: 'right'}}>Close</button>

        { deleteTitle && onDelete &&
          <button
            type='button'
            disabled={disabled}
            className='btn btn-delete'
            style={{float: actionTitle && onAction ? 'left': 'right'}}
            onClick={onDelete}>{deleteTitle}</button>
        }

        { actionTitle && onAction &&
          <button
            type='button'
            disabled={disabled}
            className='btn btn-primary'
            style={{float: 'right'}}
            onClick={onAction}>{actionTitle}</button>
        }
        <div className='clearfix'></div>
      </div>
    )
  }
}
