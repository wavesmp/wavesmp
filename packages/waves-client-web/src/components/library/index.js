import formatTime from 'format-duration'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { DEFAULT_PLAYLIST, FULL_PLAYLIST as playlistName,
         contextmenuTypes } from 'waves-client-constants'
import * as WavesActions from 'waves-client-actions'
import { getOrCreatePlaylistSelectors, getDefaultPlaylistSearch } from 'waves-client-selectors'

import { onRowDoubleClick } from '../playlist/tableActions'
import { libraryColumns } from '../table/columns'
import TablePage from '../tablepage'

const TITLE = 'Library'
const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'


class Library extends React.Component {
  getDisplayItems = (startIndex, stopIndex) => {
    const { routerSearchString, playlist, searchItems, library } = this.props

    if (routerSearchString) {
      return searchItems.slice(startIndex, stopIndex)
    }

    const { tracks } = playlist
    const { length } = tracks

    const displayItems = []
    for (let i = startIndex; i < stopIndex && i < length; i += 1) {
      const track = library[tracks[i]]
      const time = formatTime(1000 * track.duration)
      displayItems.push({...track, time, playId: i + ''})
    }
    return displayItems

  }

  onNowPlayingClick = () => {
    const { history, defaultPlaylistSearch } = this.props
    const to = { pathname: '/nowplaying', search: defaultPlaylistSearch }
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
    const { actions, playing, sidebar, playlist,
            rowsPerPage, transitions, location, history,
            searchItems, routerSearchString,
            columns, theme } = this.props
    let playId, selection, sortKey, ascending
    let playlistLoaded = false
    let numItems
    if (playlist) {
      ({ ascending, playId, sortKey, selection } = playlist)
      playlistLoaded = true
      if (routerSearchString) {
        numItems = searchItems.length
      } else {
        numItems = playlist.tracks.length
      }
    }
    return (
      <TablePage
        actions={actions}
        ascending={ascending}
        buttons={this.getButtons()}
        columns={columns}
        draggable={true}
        getDisplayItems={this.getDisplayItems}
        history={history}
        isPlayerVisible={playing.track !== null}
        isPlaying={playing.isPlaying}
        location={location}
        theme={theme}
        transitions={transitions}
        noDataMsg={NO_DATA_MSG}
        numItems={numItems}
        onContextMenu={this.onContextMenu}
        onItemEdit={this.onItemEdit}
        onRowDoubleClick={onRowDoubleClick(actions, playlistName)}
        playlistLoaded={playlistLoaded}
        playlistName={playlistName}
        playId={playId}
        routerSearchString={routerSearchString}
        rowsPerPage={rowsPerPage}
        selection={selection}
        sidebar={sidebar}
        sortKey={sortKey}
        title={TITLE}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { getRouterSearchString,
          getPlaylist,
          getSearchItems } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const { tracks, account, sidebar, transitions } = state
  const { library, playing } = tracks
  const { search } = ownProps.location
  const { rowsPerPage, theme } = account
  const columns = libraryColumns.filter(c => account.columns.has(c.title))

  return {
    playlist: getPlaylist(tracks),
    defaultPlaylistSearch: getDefaultPlaylistSearch(tracks),
    searchItems: getSearchItems(tracks, search),
    routerSearchString: getRouterSearchString(undefined, search),
    library,
    playing,
    rowsPerPage,
    columns,
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
)(Library)
