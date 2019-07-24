import React from 'react'

export default class ActionSettings extends React.PureComponent {
  onSignOut = () => {
    const { actions, history } = this.props
    actions.signOut()
    history.push('/')
  }

  render() {
    return (
      <div className='settings-columns'>
        <div className='settings-column'>
          <label>Actions</label>
          <button
            type='button'
            className='btn btn-dropdown pull-left'
            onClick={this.onSignOut}
          >
            <i className='fa fa-lg fa-sign-out' /> Sign Out
          </button>
        </div>
        <div className='settings-column' />
      </div>
    )
  }
}
