import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'

import './index.css'
import SignIn from './signin'
import Preview from './preview'
import MenuBar from '../menubar/site'


class Site extends React.Component {
  render() {
    const { actions } = this.props
    return (
      <React.Fragment>
        <MenuBar/>
        <SignIn actions={actions}/>
        <Preview/>
      </React.Fragment>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  undefined,
  mapDispatchToProps
)(Site)
