import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'

import './index.css'
import SignIn from './signin'
import Preview from './preview'
import MenuBar from '../menubar/site'
import Toasts from '../toasts'

class Site extends React.PureComponent {
  render() {
    const { actions, location, history, theme, toasts } = this.props
    return (
      <React.Fragment>
        <MenuBar />
        <SignIn actions={actions} location={location} history={history} />
        <Preview theme={theme} />
        <Toasts actions={actions} toasts={toasts} />
      </React.Fragment>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

function mapStateToProps(state) {
  return {
    theme: state.account.theme,
    toasts: state.toasts
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Site)
