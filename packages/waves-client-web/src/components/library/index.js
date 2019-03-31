import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST as playlistName,
  contextmenuTypes,
  routes
} from 'waves-client-constants'
import * as WavesActions from 'waves-client-actions'
import {
  getOrCreatePlaylistSelectors,
  getDefaultPlaylistSearch
} from 'waves-client-selectors'

import { onRowDoubleClick } from '../playlist/tableActions'
import { libraryColumns } from '../table/columns'
import TablePage from '../tablepage'

const TITLE = 'Library'
const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'

class Library extends React.PureComponent {
  onNowPlayingClick = () => {
    const { history, defaultPlaylistSearch } = this.props
    const to = { pathname: routes.nowplaying, search: defaultPlaylistSearch }
    history.push(to)
  }

  defaultButtons = []

  playlistButtons = [
    {
      name: 'Now Playing',
      onClick: this.onNowPlayingClick
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
    const {
      actions,
      playing,
      sidebar,
      playlist,
      transitions,
      pathname,
      qp,
      history,
      numItems,
      routerSearchString,
      currentPage,
      lastPage,
      displayItems,
      columns,
      theme
    } = this.props
    let playId, selection, sortKey, ascending
    let playlistLoaded = false
    if (playlist) {
      ;({ ascending, playId, sortKey, selection } = playlist)
      playlistLoaded = true
    }
    return (
      <TablePage
        actions={actions}
        ascending={ascending}
        buttons={this.getButtons()}
        columns={columns}
        draggable={true}
        history={history}
        isPlayerVisible={playing.track !== null}
        isPlaying={playing.isPlaying}
        currentPage={currentPage}
        displayItems={displayItems}
        lastPage={lastPage}
        noDataMsg={NO_DATA_MSG}
        numItems={numItems}
        onContextMenu={this.onContextMenu}
        onItemEdit={this.onItemEdit}
        onRowDoubleClick={onRowDoubleClick(actions, playlistName)}
        pathname={pathname}
        playId={playId}
        playlistLoaded={playlistLoaded}
        playlistName={playlistName}
        qp={qp}
        routerSearchString={routerSearchString}
        selection={selection}
        sidebar={sidebar}
        sortKey={sortKey}
        theme={theme}
        title={TITLE}
        transitions={transitions}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  const {
    getRouterSearchString,
    getRouterQueryParams,
    getPlaylist,
    getPagination
  } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const { tracks, account, sidebar, transitions } = state
  const { library, playing } = tracks
  const { location } = ownProps
  const { pathname, search } = location
  const { theme } = account
  const columns = libraryColumns.filter(c => account.columns.has(c.title))

  return {
    playlist: getPlaylist(state),
    defaultPlaylistSearch: getDefaultPlaylistSearch(state),
    routerSearchString: getRouterSearchString(undefined, search),
    qp: getRouterQueryParams(undefined, search),
    pathname,
    library,
    playing,
    columns,
    sidebar,
    theme,
    transitions,
    ...getPagination(state, search)
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
)(Library)
