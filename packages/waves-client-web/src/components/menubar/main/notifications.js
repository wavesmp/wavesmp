import React from 'react'

import { dropdownTypes, toastTypes } from 'waves-client-constants'

import Dropdown from './dropdown'

export default class Notifications extends React.PureComponent {
  items = [
    <li key={0}>
      <div className='menubar-dropdown-item' onClick={this.onUnsupportedClick}>
        File name mismatches
        <i className='fa fa-file-text menubar-dropdown-item-icon' />
      </div>
    </li>,
    <li key={1}>
      <div className='menubar-dropdown-item' onClick={this.onUnsupportedClick}>
        Missing metadata
        <i className='fa fa-tags menubar-dropdown-item-icon' />
      </div>
    </li>,
    <li key={2}>
      <div className='menubar-dropdown-item' onClick={this.onUnsupportedClick}>
        Missing files
        <i className='fa fa-file-o menubar-dropdown-item-icon' />
      </div>
    </li>
  ]

  onUnsupportedClick = () => {
    const { actions } = this.props
    const msg = 'Feature Unavailable'
    actions.toastAdd({ type: toastTypes.Error, msg })
  }

  render() {
    const { actions, dropdown } = this.props
    return (
      <Dropdown
        actions={actions}
        dropdown={dropdown}
        dropdownName={dropdownTypes.NOTIFICATIONS}
        iconClasses='fa fa-lg fa-globe menubar-dropdown-icon'
        headerText='Notifications'
        headerClass='fa fa-globe menubar-dropdown-item-icon'
        items={this.items}
      />
    )
  }
}
