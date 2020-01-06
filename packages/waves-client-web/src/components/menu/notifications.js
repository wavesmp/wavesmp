import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'

class Notifications extends React.PureComponent {
  onUnsupportedClick = () => {
    const { actions } = this.props
    actions.toastErr('Feature Unavailable')
  }

  items = [
    <li key={0}>
      <div className='menubar-dropdown-item' onClick={this.onUnsupportedClick}>
        File name mismatches
        <i className='fa fa-file-text menubar-dropdown-item-icon' />
      </div>
    </li>,
    <li key={1}>
      <div className='menubar-dropdown-item' onClick={this.onUnsupportedClick}>
        Missing metadata
        <i className='fa fa-tags menubar-dropdown-item-icon' />
      </div>
    </li>,
    <li key={2}>
      <div className='menubar-dropdown-item' onClick={this.onUnsupportedClick}>
        Missing files
        <i className='fa fa-file-o menubar-dropdown-item-icon' />
      </div>
    </li>
  ]

  render() {
    return (
      <ul className='menubar-dropdown-menu'>
        <li className='menubar-dropdown-header'>
          Notifications
          <i className='fa fa-globe menubar-dropdown-item-icon' />
        </li>
        <li className='menubar-dropdown-divider' />
        {this.items}
      </ul>
    )
  }
}

function mapStateToProps() {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifications)
