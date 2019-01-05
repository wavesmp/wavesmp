import formatTime from 'format-duration'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'
import { DEFAULT_PLAYLIST as playlistName,
         FULL_PLAYLIST, modalTypes, contextmenuTypes } from 'waves-client-constants'
import { getOrCreatePlaylistSelectors, getLibraryPlaylistSearch } from 'waves-client-selectors'

import TablePage from '../tablepage'
import { playlistColumns } from '../table/columns'
import { onRowDoubleClick } from '../playlist/tableActions'

const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'
const TITLE = 'Now Playing'

class NowPlaying extends React.Component {
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
      const time = formatTime(1000 * track.duration)
      displayItems.push({...track, time, playId: i + ''})
    }
    return displayItems

  }

  onLibraryClick = () => {
    const { history, libraryPlaylistSearch } = this.props
    history.push({ pathname: '/library', search: libraryPlaylistSearch })
  }

  onDelete = () => {
    const { actions } = this.props
    actions.playlistDelete(playlistName)
  }

  onClear = () => {
    const { actions } = this.props
    const props = {
      deleteTitle: 'Clear',
      title: 'Clear Playlist',
      message: `This will clear the ${TITLE} playlist. Are you sure?`,
      onDelete: this.onDelete
    }
    actions.modalSet({type: modalTypes.ACTION_CONFIRM, props})
  }

  onPlaylistSave = () => {
    const { actions } = this.props
    actions.modalSet({type: modalTypes.PLAYLIST_SAVE})
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
    const { playlist, actions, playing, sidebar,
            rowsPerPage, transitions, location, history,
            playlistSearchString, routerSearchString,
            searchItems, columns } = this.props
    let playId, selection
    let playlistLoaded = false
    let numItems
    if (playlist) {
      ({ playId, selection } = playlist)
      playlistLoaded = true
      if (routerSearchString) {
        if (routerSearchString != playlistSearchString) {
          actions.playlistSearchUpdate(playlistName, location.search)
        }
        numItems = searchItems.length
      } else {
        numItems = playlist.tracks.length
      }
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
        location={location}
        transitions={transitions}
        noDataMsg={NO_DATA_MSG}
        numItems={numItems}
        onItemEdit={this.onItemEdit}
        routerSearchString={routerSearchString}
        onContextMenu={this.onContextMenu}
        onRowDoubleClick={onRowDoubleClick(actions, playlistName)}
        playId={playId}
        playlistLoaded={playlistLoaded}
        playlistName={playlistName}
        rowsPerPage={rowsPerPage}
        selection={selection}
        sidebar={sidebar}
        title={TITLE}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { getRouterSearchString,
          getPlaylist,
          getPlaylistSearchString,
          getSearchItems } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const { tracks, account, sidebar, transitions } = state
  const { library, playing } = tracks
  const { search } = ownProps.location
  const { rowsPerPage } = account
  const columns = playlistColumns.filter(c => account.columns.has(c.title))

  return {
    playlist: getPlaylist(tracks),
    playlistSearchString: getPlaylistSearchString(tracks),
    routerSearchString: getRouterSearchString(undefined, search),
    libraryPlaylistSearch: getLibraryPlaylistSearch(tracks),
    searchItems: getSearchItems(tracks, search),
    library,
    playing,
    columns,
    rowsPerPage,
    sidebar,
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
