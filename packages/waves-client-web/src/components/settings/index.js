import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'

import ContentPage from '../contentpage'
import ActionSettings from './actionsettings'
import ColumnSettings from './columnsettings'
import SelectSettings from './selectsettings'
import VolumeSlider from './volumeslider'
import './index.css'

class Settings extends React.PureComponent {
  render() {
    const {
      actions,
      history,
      sidebar,
      transitions,
      isPlayerVisible,
      columns,
      rowsPerPage,
      theme
    } = this.props
    return (
      <ContentPage
        title='Settings'
        sidebar={sidebar}
        isPlayerVisible={isPlayerVisible}
        transitions={transitions}
      >
        <div>
          <VolumeSlider actions={actions} />
          <ColumnSettings actions={actions} columns={columns} />
          <SelectSettings
            actions={actions}
            rowsPerPage={rowsPerPage}
            theme={theme}
          />
          <ActionSettings actions={actions} history={history} />
        </div>
      </ContentPage>
    )
  }
}

function mapStateToProps(state) {
  const { account, transitions, sidebar, tracks } = state
  const { columns, rowsPerPage, theme } = account
  const { playing } = tracks
  return {
    columns,
    rowsPerPage,
    theme,
    sidebar,
    transitions,
    isPlayerVisible: playing.track !== null
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
)(Settings)
