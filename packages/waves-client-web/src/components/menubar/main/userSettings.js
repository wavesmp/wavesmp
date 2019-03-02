import React from 'react'

import { modalTypes, dropdownTypes } from 'waves-client-constants'

import Dropdown from './dropdown'

export default class UserSettings extends React.PureComponent {
  signOut = () => {
    const { actions, history } = this.props
    actions.signOut()
    history.push('/')
  }

  onAccountSettingsClick = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.SETTINGS })
  }

  items = [
    {
      text: 'Account Settings',
      classes: 'fa fa-cog menubar-dropdown-item-icon',
      onClick: this.onAccountSettingsClick
    },
    {
      text: 'Sign Out',
      classes: 'fa fa-sign-out menubar-dropdown-item-icon',
      onClick: this.signOut
    }
  ]

  iconClasses = 'fa fa-lg fa-user'

  header = {
    text: this.props.userName,
    classes: 'fa fa-user menubar-dropdown-item-icon'
  }

  render() {
    const { actions, dropdown } = this.props
    return (
      <Dropdown
        actions={actions}
        dropdown={dropdown}
        dropdownName={dropdownTypes.USER_SETTINGS}
        iconClasses={this.iconClasses}
        header={this.header}
        items={this.items}
      />
    )
  }
}
