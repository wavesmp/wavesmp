import React from 'react'

import { menuTypes } from 'waves-client-constants'

import Track from './track'
import PlaylistAdd from './track/playlistAdd'

import './index.css'

const MENUS = {
  [menuTypes.TRACK]: Track,
  [menuTypes.PLAYLIST_ADD]: PlaylistAdd
}

const EMPTY_MENU = <menu className='contextmenu' />

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
      <menu className='contextmenu contextmenu-active' style={style}>
        <Component {...props} />
      </menu>
    )
  }
}
