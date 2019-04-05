import React from 'react'
import ReactDOM from 'react-dom'

import constants from 'waves-client-constants'

import ContentEditable from './contenteditable'

const PLAY_ICON = (
  <i
    className='fa fa-lg fa-play'
    style={{ marginRight: '10px', color: '#52CA19' }}
  />
)
const PAUSE_ICON = (
  <i
    className='fa fa-lg fa-pause'
    style={{ marginRight: '10px', color: '#F17B10' }}
  />
)
const PLAY_PAUSE_PADDING = <span style={{ paddingRight: '25px' }} />
// TODO avoid hardcoding attributes (e.g. 'title') here

export class Name extends React.PureComponent {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'title', update)
  }

  render() {
    const { sample, index, isPlaying, editable, title, onBlur } = this.props

    let playPauseIcon
    let playPausePadding
    if (index === sample.index) {
      playPausePadding = null
      if (isPlaying) {
        playPauseIcon = PLAY_ICON
      } else {
        playPauseIcon = PAUSE_ICON
      }
    } else {
      playPauseIcon = null
      playPausePadding = PLAY_PAUSE_PADDING
    }
    return (
      <td>
        {playPauseIcon}
        <ContentEditable
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          html={sample.title}
          title={title}
        />
        {playPausePadding}
      </td>
    )
  }
}

export class State extends React.PureComponent {
  renderIcon(iconClasses) {
    return <i className={`fa fa-lg ${iconClasses}`} />
  }

  renderRow() {
    const { sample } = this.props
    const { state } = sample
    switch (state) {
      case 'preview':
        return this.renderIcon('fa-eye')
      case 'pending':
        return this.renderIcon('fa-spinner fa-pulse')
      case 'uploading':
        return <React.Fragment>{`${sample.uploadProgress}%`}</React.Fragment>
      default:
        return this.renderIcon('fa-check-circle common-table-status-ok')
    }
  }

  render() {
    return (
      <td className='common-columns-small-screen-hide'>{this.renderRow()}</td>
    )
  }
}

export class Time extends React.PureComponent {
  render() {
    const { sample } = this.props
    return <td className='common-columns-small-screen-hide'>{sample.time}</td>
  }
}

export class Artist extends React.PureComponent {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'artist', update)
  }

  render() {
    const { sample, editable, title, onBlur } = this.props
    return (
      <td>
        <ContentEditable
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          html={sample.artist}
          title={title}
        />
      </td>
    )
  }
}

export class Album extends React.PureComponent {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'album', update)
  }

  render() {
    const { sample, editable, title, onBlur } = this.props
    return (
      <td>
        <ContentEditable
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          html={sample.album}
          title={title}
        />
      </td>
    )
  }
}

export class Genre extends React.PureComponent {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'genre', update)
  }

  render() {
    const { sample, editable, title, onBlur } = this.props
    return (
      <td>
        <ContentEditable
          onChange={this.emitChange}
          onBlur={onBlur}
          editable={editable}
          html={sample.genre}
          title={title}
        />
      </td>
    )
  }
}

export class CreatedAt extends React.PureComponent {
  render() {
    const { sample } = this.props
    return (
      <td className='common-columns-small-screen-hide'>
        {sample.createdAtPretty}
      </td>
    )
  }
}
