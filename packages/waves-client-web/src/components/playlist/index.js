import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import * as WavesActions from 'waves-client-actions'
import {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  modalTypes,
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
  getButtons() {
    const { libraryPlaylistSearch, defaultPlaylistSearch } = this.props
    const toLibrary = {
      pathname: routes.library,
      search: libraryPlaylistSearch
    }
    const toNowPlaying = {
      pathname: routes.nowplaying,
      search: defaultPlaylistSearch
    }
    return [
      <Link key='Library' className='btn btn-primary' to={toLibrary}>
        Library
      </Link>,
      <Link key='Now Playing' className='btn btn-primary' to={toNowPlaying}>
        Now Playing
      </Link>
    ]
  }

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

  render() {
    return (
      <TablePage
        {...this.props}
        buttons={this.getButtons()}
        draggable={true}
        noDataMsg={NO_DATA_MSG}
        onItemEdit={this.onItemEdit}
        onSettingsClick={this.onSettingsClick}
        title={this.props.playlistName}
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
