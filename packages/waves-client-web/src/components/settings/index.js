import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { FULL_PLAYLIST, libTypes } from 'waves-client-constants'
import {
  getOrCreatePlaylistSelectors,
  getLibraryPlaylistSearch
} from 'waves-client-selectors'

import { libraryColumns } from '../table/columns'
import ContentPage from '../contentpage'
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
      layout,
      isPlayerVisible,
      columns,
      rowsPerPage,
      theme,
      libraryColumns,
      librarySortKey,
      libraryAscending
    } = this.props
    return (
      <ContentPage
        title='Settings'
        sidebar={sidebar}
        isPlayerVisible={isPlayerVisible}
        layout={layout}
      >
        <div>
          <VolumeSlider actions={actions} />
          <ColumnSettings actions={actions} columns={columns} />
          <SelectSettings
            actions={actions}
            rowsPerPage={rowsPerPage}
            theme={theme}
            history={history}
            libraryColumns={libraryColumns}
            librarySortKey={librarySortKey}
            libraryAscending={libraryAscending}
          />
        </div>
      </ContentPage>
    )
  }
}

function mapStateToProps(state) {
  const { account, layout, sidebar, tracks } = state
  const { columns, rowsPerPage, theme } = account
  const { playing } = tracks
  const { getRouterAscending, getRouterSortKey } = getOrCreatePlaylistSelectors(
    FULL_PLAYLIST,
    URLSearchParams,
    libTypes.WAVES
  )
  const search = getLibraryPlaylistSearch(state)
  const sortKey = getRouterSortKey(state, search)
  const ascending = getRouterAscending(state, search)
  return {
    columns,
    rowsPerPage,
    theme,
    sidebar,
    layout,
    isPlayerVisible: playing.track !== null,
    libraryColumns: libraryColumns.filter(c => c.sortable),
    librarySortKey: sortKey,
    libraryAscending: ascending
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
