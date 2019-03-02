import React from 'react'

import { contextmenuTypes } from 'waves-client-constants'

import Track from './track'
import PlaylistAdd from './track/playlistAdd'

import './index.css'

const CONTEXT_MENUS = {
  [contextmenuTypes.TRACK]: Track,
  [contextmenuTypes.PLAYLIST_ADD]: PlaylistAdd
}

const EMPTY_MENU = <menu className='contextmenu' />

/* Context menu used is used for table rows */
export default class ContextMenu extends React.PureComponent {
  render() {
    const { contextmenu } = this.props
    const numMenus = contextmenu.length
    if (numMenus === 0) {
      return EMPTY_MENU
    }

    const menu = contextmenu[numMenus - 1]
    const { type, props, x, y } = menu
    const Component = CONTEXT_MENUS[type]

    const style = {
      left: x + 'px',
      top: y + 'px'
    }
    return (
      <menu className='contextmenu contextmenu-active' style={style}>
        <Component {...props} />
      </menu>
    )
  }
}
