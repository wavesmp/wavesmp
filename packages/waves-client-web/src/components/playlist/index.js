import formatTime from 'format-duration'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'
import {
  DEFAULT_PLAYLIST,
  FULL_PLAYLIST,
  modalTypes,
  contextmenuTypes
} from 'waves-client-constants'
import {
  getOrCreatePlaylistSelectors,
  getLibraryPlaylistSearch,
  getDefaultPlaylistSearch
} from 'waves-client-selectors'

import TablePage from '../tablepage'
import { playlistColumns } from '../table/columns'
import { onRowDoubleClick } from './tableActions'

const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'

class Playlist extends React.Component {
  getDisplayItems = (startIndex, stopIndex) => {
    const { routerSearchString, searchItems, library, playlist } = this.props

    if (routerSearchString) {
      return searchItems.slice(startIndex, stopIndex)
    }

    const { tracks } = playlist
    const { length } = tracks

    const displayItems = []
    for (let i = startIndex; i < stopIndex && i < length; i += 1) {
      const track = library[tracks[i]]
      const time = formatTime(1000 * track.duration)
      displayItems.push({ ...track, time, playId: i + '' })
    }
    return displayItems
  }

  /* TODO use constant for routes / titles? */
  onLibraryClick = () => {
    const { libraryPlaylistSearch, history } = this.props
    history.push({ pathname: '/library', search: libraryPlaylistSearch })
  }

  onNowPlayingClick = () => {
    const { defaultPlaylistSearch, history } = this.props
    history.push({ pathname: '/nowplaying', search: defaultPlaylistSearch })
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
      playlistName,
      playing,
      actions,
      sidebar,
      rowsPerPage,
      transitions,
      location,
      history,
      routerSearchString,
      searchItems,
      columns,
      theme
    } = this.props
    let playId, selection
    let playlistLoaded = false
    let numItems
    if (playlist) {
      ;({ playId, selection } = playlist)
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
        buttons={this.buttons}
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
        playId={playId}
        playlistLoaded={playlistLoaded}
        playlistName={playlistName}
        routerSearchString={routerSearchString}
        rowsPerPage={rowsPerPage}
        selection={selection}
        sidebar={sidebar}
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
    getPlaylist,
    getSearchItems
  } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const { tracks, account, sidebar, transitions } = state
  const { library, playing } = tracks
  const { search } = ownProps.location
  const { rowsPerPage, theme } = account
  const columns = playlistColumns.filter(c => account.columns.has(c.title))

  return {
    playlist: getPlaylist(tracks),
    routerSearchString: getRouterSearchString(undefined, search),
    libraryPlaylistSearch: getLibraryPlaylistSearch(tracks),
    defaultPlaylistSearch: getDefaultPlaylistSearch(tracks),
    searchItems: getSearchItems(tracks, search),
    playlistName,
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
)(Playlist)
