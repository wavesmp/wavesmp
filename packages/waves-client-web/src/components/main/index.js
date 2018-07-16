import React from 'react'
import SideBar from '../sidebar'
import MenuBar from '../menubar/main'
import Upload from '../upload'
import ContextMenu from '../contextmenu'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as WavesActions from 'waves-client-actions'
import Modal from '../modal'
import { Route } from 'react-router-dom'

import NowPlaying from '../nowplaying'
import Playlist from '../playlist'
import Library from '../library'

class MainApp extends React.Component {
  render() {
    const { modal, sidebar, playlists, playing,
            actions, contextmenu,
            account, location, history } = this.props
    const { user } = account
    if (!user) {
      return (
        null
      )
    }
    return (
      <div onClick={actions.contextmenuReset}>
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
    account: state.account
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
