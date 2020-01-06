import React from 'react'

export function LibraryDelete({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-trash-o menu-track-delete' />
      &nbsp;&nbsp;Delete
    </li>
  )
}

export function PlaylistRemove({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-times menu-track-remove' />
      &nbsp;&nbsp;Remove
    </li>
  )
}

export function Download({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-download menu-track-download' />
      &nbsp;&nbsp;Download
    </li>
  )
}

export function PlaylistAdd({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-plus-circle menu-track-add' />
      &nbsp;&nbsp;Add to Playlist...
    </li>
  )
}

export function Back({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-chevron-circle-left menu-track-back' />
      &nbsp;&nbsp;Back
    </li>
  )
}

export function NowPlayingAdd({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-plus menu-track-add' />
      &nbsp;&nbsp;Add to Now Playing
    </li>
  )
}

export function Play({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-play menu-track-play' />
      &nbsp;&nbsp;Play
    </li>
  )
}

export function Pause({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-pause menu-track-pause' />
      &nbsp;&nbsp;Pause
    </li>
  )
}

export function PlayResume({ onClick }) {
  return (
    <li className='btn btn-default menu-track-item' onClick={onClick}>
      <i className='fa fa-lg fa-play-circle menu-track-play' />
      &nbsp;&nbsp;Resume
    </li>
  )
}

export class PlaylistAddItem extends React.PureComponent {
  onClick = () => {
    const { name, onPlaylistAdd } = this.props
    onPlaylistAdd(name)
  }

  render() {
    const { name } = this.props
    return (
      <li className='btn btn-default menu-track-item' onClick={this.onClick}>
        <i className='fa fa-lg fa-list' />
        &nbsp;&nbsp;{name}
      </li>
    )
  }
}
