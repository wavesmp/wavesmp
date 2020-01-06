import React from 'react'

import { menuTypes } from 'waves-client-constants'

import Track from './track'
import PlaylistAdd from './track/playlistAdd'
import Notifications from './notifications'
import UserSettings from './usersettings'

import './index.css'

const MENUS = {
  [menuTypes.TRACK]: Track,
  [menuTypes.PLAYLIST_ADD]: PlaylistAdd,
  [menuTypes.NOTIFICATIONS]: Notifications,
  [menuTypes.USER_SETTINGS]: UserSettings
}

const EMPTY_MENU = <menu className='menu' />

/* Menu used is used for table rows */
export default class Menu extends React.PureComponent {
  render() {
    const { menu } = this.props
    const numMenus = menu.length
    if (numMenus === 0) {
      return EMPTY_MENU
    }

    const { type, props, transform } = menu[numMenus - 1]
    const Component = MENUS[type]
    const style = { transform }

    return (
      <menu className='menu menu-active' style={style}>
        <Component {...props} />
      </menu>
    )
  }
}
