import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'

import * as WavesActions from 'waves-client-actions'
import { TOGGLE_DATA_KEY, DROPDOWN_DATA_VALUE,
         MODAL_DATA_VALUE } from 'waves-client-constants'

import SideBar from '../sidebar'
import MenuBar from '../menubar/main'
import Upload from '../upload'
import ContextMenu from '../contextmenu'
import Modal from '../modal'
import NowPlaying from '../nowplaying'
import Playlist from '../playlist'
import Library from '../library'

class MainApp extends React.Component {
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

    if (dropdown && !this.ancestorHasAttribute(
        target, TOGGLE_DATA_KEY, DROPDOWN_DATA_VALUE)) {
      actions.dropdownSet(null)
    }

    if (modal && !this.ancestorHasAttribute(
        target, TOGGLE_DATA_KEY, MODAL_DATA_VALUE)) {
      actions.modalSet(null)
    }

  }

  render() {
    const { modal, sidebar, playlists, playing,
            actions, contextmenu, dropdown,
            account, location, history } = this.props
    const { user } = account
    if (!user) {
      return (
        null
      )
    }
    return (
      <div onClick={this.onClick}>
        <Route path='/nowplaying' component={NowPlaying}/>
        <Route path='/library' component={Library}/>
        <Route path='/upload' component={Upload}/>
        <Route path='/playlist/:playlist' component={Playlist}/>
        <SideBar actions={actions}
                 sidebar={sidebar}
                 playlists={playlists}
                 playing={playing}
                 location={location}
                 userName={user.name}/>
        <MenuBar actions={actions}
                 dropdown={dropdown}
                 playing={playing}
                 history={history}
                 userName={user.name}/>
        <ContextMenu contextmenu={contextmenu}/>
        <Modal modal={modal}/>
        <div id='player'/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    playlists: state.tracks.playlists,
    playing: state.tracks.playing,
    sidebar: state.sidebar,
    contextmenu: state.contextmenu,
    modal: state.modal,
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
