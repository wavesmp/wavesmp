import React from 'react'

import Dropdown from './dropdown'

export default class UserSettings extends React.Component {
  signOut = () => {
    const { actions, history } = this.props
    actions.signOut()
    history.push('/')
  }

  onAccountSettingsClick = () => {
    const { actions } = this.props
    actions.modalSet({type: 'settings'})
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
    // TODO remove hardcoded name
    text: 'Omar Soriano',
    classes: 'fa fa-user menubar-dropdown-item-icon'
  }

  render() {
    return (
        <Dropdown
          iconClasses={this.iconClasses}
          header={this.header}
          items={this.items}
        />
    )
  }
}
