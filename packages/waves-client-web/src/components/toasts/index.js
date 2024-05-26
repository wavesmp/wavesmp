import React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'

import { TOAST_ID_ATTR, toastTypes } from 'waves-client-constants'

import './index.css'

const ICONS = {
  [toastTypes.Success]: 'fa fa-lg fa-2x fa-check',
  [toastTypes.Error]: 'fa fa-lg fa-2x fa-exclamation-triangle',
}

export default class Toasts extends React.PureComponent {
  onCloseClick = (ev) => {
    const { actions } = this.props
    const toastId = parseInt(ev.currentTarget.getAttribute(TOAST_ID_ATTR), 10)
    actions.toastRemove(toastId)
  }

  render() {
    const { toasts } = this.props
    return (
      <div className='toasts-container'>
        <CSSTransitionGroup
          transitionName='fade'
          transitionEnterTimeout={800}
          transitionLeaveTimeout={300}
        >
          {toasts.map((toast) => {
            const { type, msg } = toast
            const iconClass = ICONS[type]
            const lowerType = type.toLowerCase()
            return (
              <div key={toast.id} className='toast-container'>
                <div className={`toast-bar toast-bar-${lowerType}`} />
                <div className='toast-content'>
                  <div
                    className={`toast-icon-container toast-icon-container-${lowerType}`}
                  >
                    <i className={iconClass} />
                  </div>
                  <div className='toast-text-container'>
                    <div>
                      <b>{type}</b>
                    </div>
                    <div>{msg}</div>
                  </div>
                  <div
                    className='toast-close'
                    data-toast={toast.id}
                    onClick={this.onCloseClick}
                  >
                    <i className='fa fa-lg fa-times' />
                  </div>
                </div>
              </div>
            )
          })}
        </CSSTransitionGroup>
      </div>
    )
  }
}
