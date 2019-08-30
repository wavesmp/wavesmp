import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import * as WavesActions from 'waves-client-actions'
import {
  NOW_PLAYING_NAME as playlistName,
  LIBRARY_NAME,
  modalTypes,
  routes
} from 'waves-client-constants'
import {
  getOrCreatePlaylistSelectors,
  getLibraryPlaylistSearch
} from 'waves-client-selectors'

import TablePage from '../tablepage'
import { playlistColumns } from '../table/columns'

const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'

class NowPlaying extends React.PureComponent {
  onClear = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.PLAYLIST_CLEAR })
  }

  onPlaylistSave = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.PLAYLIST_SAVE })
  }

  defaultButtons = [
    <button key='Clear' className='btn btn-primary' onClick={this.onClear}>
      Clear
    </button>,
    <button
      key='Save'
      className='btn btn-primary'
      onClick={this.onPlaylistSave}
    >
      Save
    </button>
  ]

  getPlaylistButtons() {
    const { libraryPlaylistSearch } = this.props
    const to = { pathname: routes.library, search: libraryPlaylistSearch }
    return [
      <Link key='Library' className='btn btn-primary' to={to}>
        Library
      </Link>
    ]
  }

  getButtons() {
    const { sidebar } = this.props
    if (sidebar) {
      return this.getPlaylistButtons()
    }
    return this.defaultButtons
  }

  onItemEdit = (id, attr, update) => {
    const { actions } = this.props
    actions.tracksInfoUpdate(id, attr, update, LIBRARY_NAME)
  }

  render() {
    return (
      <TablePage
        {...this.props}
        buttons={this.getButtons()}
        draggable={true}
        orderable={true}
        noDataMsg={NO_DATA_MSG}
        onItemEdit={this.onItemEdit}
        playlistName={playlistName}
        title='Now Playing'
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  const {
    getRouterQueryParams,
    getRouterSearchString,
    getPlaylistProps
  } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams, LIBRARY_NAME)
  const { tracks, account, menubar, sidebar, layout } = state
  const { playing } = tracks
  const { isPlaying } = playing
  const { location } = ownProps
  const { pathname, search } = location
  const { theme } = account
  const columns = playlistColumns.filter(c => account.columns.has(c.title))

  return {
    qp: getRouterQueryParams(undefined, search),
    routerSearchString: getRouterSearchString(undefined, search),
    libraryPlaylistSearch: getLibraryPlaylistSearch(state),
    pathname,
    isPlaying,
    columns,
    menubar,
    sidebar,
    theme,
    layout,
    ...getPlaylistProps(state, search)
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
)(NowPlaying)
