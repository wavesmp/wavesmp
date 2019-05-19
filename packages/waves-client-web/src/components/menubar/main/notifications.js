import React from 'react'

import { dropdownTypes, toastTypes } from 'waves-client-constants'

import Dropdown from './dropdown'

export default class Notifications extends React.PureComponent {
  items = [
    {
      text: 'File name mismatches',
      classes: 'fa fa-file-text menubar-dropdown-item-icon',
      onClick: this.onUnsupportedClick
    },
    {
      text: 'Missing metadata',
      classes: 'fa fa-tags menubar-dropdown-item-icon',
      onClick: this.onUnsupportedClick
    },
    {
      text: 'Missing files',
      classes: 'fa fa-file-o menubar-dropdown-item-icon',
      onClick: this.onUnsupportedClick
    }
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
