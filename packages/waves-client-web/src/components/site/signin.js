import React from 'react'

import { toastTypes } from 'waves-client-constants'

import UserInput from './userInput'


export default class SignIn extends React.Component {
  onUnsupportedClick = () => {
    const { actions } = this.props
    actions.toastAdd({ type: toastTypes.Error, msg: 'Feature Unavailable' })
  }

  signIn = async () => {
    const { history, actions, location } = this.props
    try {
      const user = await actions.signIn('google')
      const from = location.state.from || { pathname: '/nowplaying' }
      history.push(from)
    } catch (err) {
      // TODO standardize errors across providers
      actions.toastAdd({ type: toastTypes.Error, msg: err.error || err.toString() })
      console.log('Error signing in')
      console.log(err)
    }
  }

        // Custom user/pass not supported
        // <UserInput iconClass='fa-user-plus' placeholder='Email Address'/>
        // <UserInput iconClass='fa-key' placeholder='Password'/>
        // <label className='btn btn-ok site-create-account-button' onClick={this.onUnsupportedClick}>Create Account</label>
        // <div className='site-idp-separator'/>
        // <p className='site-idp-separator-words'><strong>OR</strong></p>
        // <div className='site-idp-separator'/>

  render() {
    return (
      <div className='site-main-left'>
        <h1><strong>Waves Music Player</strong></h1>
        <h2>Your Music</h2>
        <h2>On Any Device</h2>
        <h2>On Any Platform</h2>
        <div className='site-login-separator'/>
        <h3>Start playing now</h3>
        <div className='btn btn-ok site-google-button'
               onClick={this.signIn}>
          <img className='site-google-login-img' src='https://google-developers.appspot.com/identity/sign-in/g-normal.png'/>
          <label className='site-google-login-text'>Sign in with Google</label>
        </div>
      </div>
    )
  }
}
