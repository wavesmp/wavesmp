import React from 'react'

import UserInput from './userInput'

function onUnsupportedClick(ev) {
  toastr.error('This feature is coming soon!', 'Feature Unavailable')
}


export default class SignIn extends React.Component {
  // TODO think of err handling
  signIn = async () => {
    const { history, actions, location } = this.props
    actions.signIn('google')
    const defaultFrom = { from: { pathname: '/nowplaying' } }
    const { from } = location.state || defaultFrom
    history.push(from)
  }

  render() {
    return (
      <div className='site-main-left'>
        <h1><strong>Waves Music Player</strong></h1>
        <h2>Your Music</h2>
        <h2>On Any Device</h2>
        <h2 className='site-login-separator'>On Any Platform</h2>
        <h3>Start playing now</h3>
        <UserInput iconClass='fa-user-plus' placeholder='Email Address'/>
        <UserInput iconClass='fa-key' placeholder='Password'/>
        <label className='btn btn-ok site-create-account-button' onClick={onUnsupportedClick}>Create Account</label>
        <div className='site-idp-separator'/>
        <p className='site-idp-separator-words'><strong>OR</strong></p>
        <div className='site-idp-separator'/>
        <img className='site-google-login-img'
             src='https://google-developers.appspot.com/identity/sign-in/g-normal.png'/>
        <label className='btn btn-ok site-create-account-button site-google-login-button'
               onClick={this.signIn}>Sign in with Google</label>
      </div>
    )
  }
}
