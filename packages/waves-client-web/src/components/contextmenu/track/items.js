import React from 'react'

import constants from 'waves-client-constants'

export const LibraryDelete = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconDeleteColor }}
      className='fa fa-lg fa-trash-o'
    />
    &nbsp;&nbsp;Delete
  </React.Fragment>
)

export const PlaylistRemove = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconRemoveColor }}
      className='fa fa-lg fa-times'
    />
    &nbsp;&nbsp;Remove
  </React.Fragment>
)

export const Download = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconDownloadColor }}
      className='fa fa-lg fa-download'
    />
    &nbsp;&nbsp;Download
  </React.Fragment>
)

export const PlaylistAdd = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconAddColor }}
      className='fa fa-lg fa-plus-circle'
    />
    &nbsp;&nbsp;Add to Playlist...
  </React.Fragment>
)

export const Back = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconBackColor }}
      className='fa fa-lg fa-chevron-circle-left'
    />
    &nbsp;&nbsp;Back
  </React.Fragment>
)

export const NowPlayingAdd = createContextMenuItem(
  <React.Fragment>
    <i style={{ color: constants.iconAddColor }} className='fa fa-lg fa-plus' />
    &nbsp;&nbsp;Add to Now Playing
  </React.Fragment>
)

export const Play = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconPlayColor }}
      className='fa fa-lg fa-play'
    />
    &nbsp;&nbsp;Play
  </React.Fragment>
)

export const Pause = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconPauseColor }}
      className='fa fa-lg fa-pause'
    />
    &nbsp;&nbsp;Pause
  </React.Fragment>
)

export const PlayResume = createContextMenuItem(
  <React.Fragment>
    <i
      style={{ color: constants.iconPlayColor }}
      className='fa fa-lg fa-play-circle'
    />
    &nbsp;&nbsp;Resume
  </React.Fragment>
)

function createContextMenuItem(Component) {
  return class extends React.Component {
    render() {
      const { onClick } = this.props
      return (
        <li className='btn btn-default contextmenu-item' onClick={onClick}>
          {Component}
        </li>
      )
    }
  }
}

// TODO PlaylistAdd item accepts a name.. try to refactor with other components
export class PlaylistAddItem extends React.Component {
  render() {
    const { onClick, title } = this.props
    return (
      <li className='btn btn-default contextmenu-item' onClick={onClick}>
        <i className='fa fa-lg fa-list' />
        &nbsp;&nbsp;{title}
      </li>
    )
  }
}
