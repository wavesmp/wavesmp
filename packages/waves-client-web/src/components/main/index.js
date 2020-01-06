import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'

import * as WavesActions from 'waves-client-actions'
import {
  TOGGLE_DATA_KEY,
  DROPDOWN_DATA_VALUE,
  MODAL_DATA_VALUE,
  routes
} from 'waves-client-constants'
import { getPlaylistSelectors, getPlaylistSearch } from 'waves-client-selectors'
import { getPlaylistNameFromRoute, filterSelection } from 'waves-client-util'

import Boundary from '../boundary'
import SideBar from '../sidebar'
import MenuBar from '../menubar/main'
import Upload from '../upload'
import Menu from '../menu'
import Modal from '../modal'
import NowPlaying from '../nowplaying'
import Playlist from '../playlist'
import Toasts from '../toasts'
import Library from '../library'
import Settings from '../settings'

class MainApp extends React.PureComponent {
  ancestorHasAttribute(node, key, val) {
    /* document object does not have parent node.
     * Can't just check for node here, since document
     * does not have getAttribute method */
    while (node.parentNode) {
      if (node.getAttribute(key) === val) {
        return true
      }
      node = node.parentNode
    }
    return false
  }

  onClick = ev => {
    const { actions, menu, dropdown, modal } = this.props
    const { target } = ev
    if (menu.length !== 0) {
      actions.menuReset()
    }

    if (
      dropdown &&
      !this.ancestorHasAttribute(target, TOGGLE_DATA_KEY, DROPDOWN_DATA_VALUE)
    ) {
      actions.dropdownSet(null)
    }

    if (
      modal &&
      !this.ancestorHasAttribute(target, TOGGLE_DATA_KEY, MODAL_DATA_VALUE)
    ) {
      actions.modalSet(null)
    }
  }

  render() {
    const {
      err,
      menubar,
      filteredSelection,
      index,
      playlistName,
      modal,
      sidebar,
      playlists,
      playing,
      actions,
      menu,
      dropdown,
      account,
      layout,
      location,
      history,
      toasts
    } = this.props
    const { user } = account
    return (
      <Boundary err={err}>
        <div onClick={this.onClick}>
          <Route path={routes.nowplaying} component={NowPlaying} />
          <Route path={routes.library} component={Library} />
          <Route path={routes.upload} component={Upload} />
          <Route path={routes.playlist} component={Playlist} />
          <Route path={routes.settings} component={Settings} />
          <SideBar
            actions={actions}
            sidebar={sidebar}
            playlists={playlists}
            playing={playing}
            pathname={location.pathname}
            userName={user.name}
          />
          <MenuBar
            actions={actions}
            dropdown={dropdown}
            layout={layout}
            menubar={menubar}
            filteredSelection={filteredSelection}
            index={index}
            playlistName={playlistName}
            playing={playing}
            history={history}
            userName={user.name}
          />
          <Menu menu={menu} />
          <Modal history={history} location={location} modal={modal} />
          <Toasts actions={actions} toasts={toasts} />
        </div>
      </Boundary>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { menubar } = state
  const { location } = ownProps
  const { pathname } = location
  const props = {
    playlists: state.tracks.playlists,
    playing: state.tracks.playing,
    sidebar: state.sidebar,
    menu: state.menu,
    err: state.err,
    layout: state.layout,
    menubar,
    modal: state.modal,
    toasts: state.toasts,
    account: state.account,
    dropdown: state.dropdown
  }
  if (menubar) {
    const playlistName = getPlaylistNameFromRoute(pathname)
    if (playlistName) {
      const search = getPlaylistSearch(state, playlistName)
      const { getPlaylistProps } = getPlaylistSelectors(playlistName)
      const { index, selection, displayItems } = getPlaylistProps(state, search)
      const filteredSelection = filterSelection(displayItems, selection)

      props.playlistName = playlistName
      props.index = index
      props.filteredSelection = filteredSelection
    }
  }
  return props
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainApp)
