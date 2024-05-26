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
    actions.menuReset()
    history.push('/')
  }

  render() {
    const { actions, userName } = this.props
    return (
      <ul className='menu-bar'>
        <li className='menu-bar-header'>
          {userName}
          <i className='fa fa-user menu-bar-item-icon' />
        </li>
        <li className='menu-bar-divider' />
        <li>
          <Link
            className='menu-bar-item'
            to={routes.settings}
            onClick={actions.menuReset}
          >
            Account Settings
            <i className='fa fa-cog menu-bar-item-icon' />
          </Link>
        </li>
        <li>
          <div className='menu-bar-item' onClick={this.signOut}>
            Sign Out
            <i className='fa fa-sign-out menu-bar-item-icon' />
          </div>
        </li>
      </ul>
    )
  }
}

function mapStateToProps(state) {
  const { account } = state
  const { user } = account
  return {
    userName: user && user.name,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
