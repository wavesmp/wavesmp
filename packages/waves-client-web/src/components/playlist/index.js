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
    const {
      playlist,
      playlistName,
      playing,
      loaded,
      index,
      selection,
      actions,
      sidebar,
      transitions,
      pathname,
      qp,
      history,
      routerSearchString,
      numItems,
      currentPage,
      lastPage,
      displayItems,
      columns,
      theme
    } = this.props
    return (
      <TablePage
        actions={actions}
        buttons={this.buttons}
        columns={columns}
        draggable={true}
        history={history}
        currentPage={currentPage}
        displayItems={displayItems}
        lastPage={lastPage}
        isPlayerVisible={playing.track !== null}
        isPlaying={playing.isPlaying}
        noDataMsg={NO_DATA_MSG}
        numItems={numItems}
        onContextMenu={this.onContextMenu}
        onItemEdit={this.onItemEdit}
        onSettingsClick={this.onSettingsClick}
        pathname={pathname}
        index={index}
        playlistLoaded={loaded}
        playlistName={playlistName}
        qp={qp}
        routerSearchString={routerSearchString}
        selection={selection}
        sidebar={sidebar}
        theme={theme}
        title={playlistName}
        transitions={transitions}
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
  const { pathname, search } = ownProps.location
  const { theme } = account
  const columns = playlistColumns.filter(c => account.columns.has(c.title))

  return {
    qp: getRouterQueryParams(undefined, search),
    routerSearchString: getRouterSearchString(undefined, search),
    libraryPlaylistSearch: getLibraryPlaylistSearch(state),
    defaultPlaylistSearch: getDefaultPlaylistSearch(state),
    playlistName,
    pathname,
    playing,
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
