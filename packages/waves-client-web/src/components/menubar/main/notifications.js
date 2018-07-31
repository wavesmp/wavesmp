import React from 'react'

import { dropdownTypes } from 'waves-client-constants'

import Dropdown from './dropdown'


function onUnsupportedClick(ev) {
  toastr.error('This feature is coming soon!', 'Feature Unavailable')
}


export default class Notifications extends React.Component {
  iconClasses = 'fa fa-lg fa-globe'

  header = {
    text: 'Notifications',
    classes: 'fa fa-globe menubar-dropdown-item-icon'
  }

  items = [
    {
      text: 'File name mismatches',
      classes: 'fa fa-file-text menubar-dropdown-item-icon',
      onClick: onUnsupportedClick
    },
    {
      text: 'Missing metadata',
      classes: 'fa fa-tags menubar-dropdown-item-icon',
      onClick: onUnsupportedClick
    },
    {
      text: 'Missing files',
      classes: 'fa fa-file-o menubar-dropdown-item-icon',
      onClick: onUnsupportedClick
    }
  ]

  render() {
    const { actions, dropdown } = this.props
    return (
        <Dropdown
          actions={actions}
          dropdown={dropdown}
          dropdownName={dropdownTypes.NOTIFICATIONS}
          iconClasses={this.iconClasses}
          header={this.header}
          items={this.items}
        />
    )
  }
}
