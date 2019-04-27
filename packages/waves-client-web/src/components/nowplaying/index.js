import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'
import {
  DEFAULT_PLAYLIST as playlistName,
  FULL_PLAYLIST,
  modalTypes,
  contextmenuTypes,
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
  onLibraryClick = () => {
    const { history, libraryPlaylistSearch } = this.props
    history.push({ pathname: routes.library, search: libraryPlaylistSearch })
  }

  onClear = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.PLAYLIST_CLEAR })
  }

  onPlaylistSave = () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.PLAYLIST_SAVE })
  }

  defaultButtons = [
    {
      name: 'Clear',
      onClick: this.onClear
    },
    {
      name: 'Save',
      onClick: this.onPlaylistSave
    }
  ]

  // TODO These should be links
  playlistButtons = [
    {
      name: 'Library',
      onClick: this.onLibraryClick
    }
  ]

  getButtons() {
    const { sidebar } = this.props
    if (sidebar === 'playlist') {
      return this.playlistButtons
    }
    return this.defaultButtons
  }

  onItemEdit = (id, attr, update) => {
    const { actions } = this.props
    actions.libraryInfoUpdate(id, attr, update)
  }

  onContextMenu = ({ pageX: x, pageY: y }, props) => {
    const { actions } = this.props
    actions.contextmenuSet({
      x,
      y,
      type: contextmenuTypes.TRACK,
      props
    })
  }

  render() {
    return (
      <TablePage
        {...this.props}
        buttons={this.getButtons()}
        draggable={true}
        noDataMsg={NO_DATA_MSG}
        onContextMenu={this.onContextMenu}
        onItemEdit={this.onItemEdit}
        pathname={location.pathname}
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
  } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const { tracks, account, sidebar, transitions } = state
  const { playing } = tracks
  const { isPlaying } = playing
  const isPlayerVisible = playing.track != null
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
    isPlayerVisible,
    columns,
    sidebar,
    theme,
    transitions,
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
