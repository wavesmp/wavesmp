import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'
import {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  modalTypes,
  contextmenuTypes,
  routes
} from 'waves-client-constants'
import {
  getOrCreatePlaylistSelectors,
  getLibraryPlaylistSearch,
  getDefaultPlaylistSearch
} from 'waves-client-selectors'

import TablePage from '../tablepage'
import { playlistColumns } from '../table/columns'

const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'

class Playlist extends React.PureComponent {
  onLibraryClick = () => {
    const { libraryPlaylistSearch, history } = this.props
    history.push({ pathname: routes.library, search: libraryPlaylistSearch })
  }

  onNowPlayingClick = () => {
    const { defaultPlaylistSearch, history } = this.props
    history.push({ pathname: routes.nowplaying, search: defaultPlaylistSearch })
  }

  buttons = [
    {
      name: 'Library',
      onClick: this.onLibraryClick
    },
    {
      name: 'Now Playing',
      onClick: this.onNowPlayingClick
    }
  ]

  onSettingsClick = () => {
    const { actions, playlistName } = this.props
    actions.modalSet({
      type: modalTypes.PLAYLIST_SETTINGS,
      props: { playlistName }
    })
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
        buttons={this.buttons}
        draggable={true}
        noDataMsg={NO_DATA_MSG}
        onContextMenu={this.onContextMenu}
        onItemEdit={this.onItemEdit}
        onSettingsClick={this.onSettingsClick}
        title={playlistName}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  const playlistName = ownProps.match.params.playlist
  const {
    getRouterSearchString,
    getRouterQueryParams,
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
    defaultPlaylistSearch: getDefaultPlaylistSearch(state),
    playlistName,
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
)(Playlist)
