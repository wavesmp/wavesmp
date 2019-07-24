import React from 'react'
import { Link } from 'react-router-dom'

import { dropdownTypes, routes } from 'waves-client-constants'

import Dropdown from './dropdown'

export default class UserSettings extends React.PureComponent {
  signOut = () => {
    const { actions, history } = this.props
    actions.signOut()
    history.push('/')
  }

  items = [
    <li key={0}>
      <Link className='menubar-dropdown-item' to={routes.settings}>
        Account Settings
        <i className='fa fa-cog menubar-dropdown-item-icon' />
      </Link>
    </li>,
    <li key={1}>
      <div className='menubar-dropdown-item' onClick={this.signOut}>
        Sign Out
        <i className='fa fa-sign-out menubar-dropdown-item-icon' />
      </div>
    </li>
  ]

  render() {
    const { actions, dropdown, userName } = this.props
    return (
      <Dropdown
        actions={actions}
        dropdown={dropdown}
        dropdownName={dropdownTypes.USER_SETTINGS}
        iconClasses='fa fa-lg fa-user menubar-dropdown-icon'
        headerText={userName}
        headerClass='fa fa-user menubar-dropdown-item-icon'
        items={this.items}
      />
    )
  }
}
