import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { routes } from 'waves-client-constants'

class UserSettings extends React.PureComponent {
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
    const { userName } = this.props
    return (
      <ul className='menubar-dropdown-menu'>
        <li className='menubar-dropdown-header'>
          {userName}
          <i className='fa fa-user menubar-dropdown-item-icon' />
        </li>
        <li className='menubar-dropdown-divider' />
        {this.items}
      </ul>
    )
  }
}

function mapStateToProps(state) {
  const { account } = state
  return {
    userName: account.user.name
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserSettings)
