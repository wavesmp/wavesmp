import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

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

import { libraryColumns } from '../table/columns'
import TablePage from '../tablepage'

const NO_DATA_MSG = 'Empty playlist. Go ahead and add some tracks!'

class Library extends React.PureComponent {
  getPlaylistButtons() {
    const { defaultPlaylistSearch } = this.props
    const to = { pathname: routes.nowplaying, search: defaultPlaylistSearch }
    return [
      <Link key='Now Playing' className='btn btn-primary' to={to}>
        Now Playing
      </Link>
    ]
  }

  getButtons() {
    const { sidebar } = this.props
    if (sidebar === 'playlist') {
      return this.getPlaylistButtons()
    }
    return null
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
        playlistName={playlistName}
        title='Library'
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
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
  const columns = libraryColumns.filter(c => account.columns.has(c.title))

  return {
    defaultPlaylistSearch: getDefaultPlaylistSearch(state),
    qp: getRouterQueryParams(undefined, search),
    routerSearchString: getRouterSearchString(undefined, search),
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
)(Library)
