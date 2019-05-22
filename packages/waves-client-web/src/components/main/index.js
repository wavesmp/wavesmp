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

import Boundary from '../boundary'
import SideBar from '../sidebar'
import MenuBar from '../menubar/main'
import Upload from '../upload'
import ContextMenu from '../contextmenu'
import Modal from '../modal'
import NowPlaying from '../nowplaying'
import Playlist from '../playlist'
import Toasts from '../toasts'
import Library from '../library'

class MainApp extends React.PureComponent {
  ancestorHasAttribute(node, key, val) {
    /* document object does not have parent node.
     * Can't just check for node here, since document
     * does not have getAttribute method*/
    while (node.parentNode) {
      if (node.getAttribute(key) === val) {
        return true
      }
      node = node.parentNode
    }
    return false
  }

  onClick = ev => {
    const { actions, contextmenu, dropdown, modal } = this.props
    const { target } = ev
    if (contextmenu.length !== 0) {
      actions.contextmenuReset()
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
      modal,
      sidebar,
      playlists,
      playing,
      actions,
      contextmenu,
      dropdown,
      account,
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
            playing={playing}
            history={history}
            userName={user.name}
          />
          <ContextMenu contextmenu={contextmenu} />
          <Modal history={history} modal={modal} />
          <Toasts actions={actions} toasts={toasts} />
        </div>
      </Boundary>
    )
  }
}

function mapStateToProps(state) {
  return {
    playlists: state.tracks.playlists,
    playing: state.tracks.playing,
    sidebar: state.sidebar,
    contextmenu: state.contextmenu,
    err: state.err,
    modal: state.modal,
    toasts: state.toasts,
    account: state.account,
    dropdown: state.dropdown
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
)(MainApp)
