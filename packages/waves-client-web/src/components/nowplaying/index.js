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
import { onRowDoubleClick } from '../playlist/tableActions'
import { normalizeTrack } from '../../util'

const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'
const TITLE = 'Now Playing'

class NowPlaying extends React.PureComponent {
  getDisplayItems = (startIndex, stopIndex) => {
    const { routerSearchString, searchItems, playlist, library } = this.props
    if (routerSearchString) {
      return searchItems.slice(startIndex, stopIndex)
    }

    const { tracks } = playlist
    const { length } = tracks

    const displayItems = []
    for (let i = startIndex; i < stopIndex && i < length; i += 1) {
      const track = library[tracks[i]]
      displayItems.push(normalizeTrack(track, i))
    }
    return displayItems
  }

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

  onContextMenu = (ev, itemPlayId, trackId, bulk, playlistName, playId) => {
    const { actions } = this.props
    actions.contextmenuSet({
      x: ev.pageX,
      y: ev.pageY,
      type: contextmenuTypes.TRACK,
      props: {
        itemPlayId,
        trackId,
        bulk,
        playlistName,
        playId
      }
    })
  }

  render() {
    const {
      playlist,
      actions,
      playing,
      sidebar,
      rowsPerPage,
      transitions,
      pathname,
      qp,
      history,
      routerSearchString,
      numItems,
      columns,
      theme
    } = this.props
    let playId, selection
    let playlistLoaded = false
    if (playlist) {
      ;({ playId, selection } = playlist)
      playlistLoaded = true
    }
    return (
      <TablePage
        actions={actions}
        buttons={this.getButtons()}
        columns={columns}
        draggable={true}
        getDisplayItems={this.getDisplayItems}
        history={history}
        isPlayerVisible={playing.track !== null}
        isPlaying={playing.isPlaying}
        noDataMsg={NO_DATA_MSG}
        numItems={numItems}
        onContextMenu={this.onContextMenu}
        onItemEdit={this.onItemEdit}
        onRowDoubleClick={onRowDoubleClick(actions, playlistName)}
        pathname={location.pathname}
        playId={playId}
        playlistLoaded={playlistLoaded}
        playlistName={playlistName}
        qp={qp}
        routerSearchString={routerSearchString}
        rowsPerPage={rowsPerPage}
        selection={selection}
        sidebar={sidebar}
        theme={theme}
        title={TITLE}
        transitions={transitions}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  const {
    getRouterQueryParams,
    getRouterSearchString,
    getPlaylist,
    getSearchItems,
    getNumItems
  } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const { tracks, account, sidebar, transitions } = state
  const { library, playing } = tracks
  const { location } = ownProps
  const { pathname, search } = location
  const { rowsPerPage, theme } = account
  const columns = playlistColumns.filter(c => account.columns.has(c.title))

  return {
    playlist: getPlaylist(state),
    routerSearchString: getRouterSearchString(undefined, search),
    qp: getRouterQueryParams(undefined, search),
    pathname,
    libraryPlaylistSearch: getLibraryPlaylistSearch(state),
    searchItems: getSearchItems(state, search),
    numItems: getNumItems(state, search),
    library,
    playing,
    columns,
    rowsPerPage,
    sidebar,
    theme,
    transitions
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
