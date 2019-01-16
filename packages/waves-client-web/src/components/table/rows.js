import React from 'react'
import ReactDOM from 'react-dom'

import constants from 'waves-client-constants'

import ContentEditable from './contenteditable'

const PLAY_ICON = (
  <i className='fa fa-lg fa-play'
     style={{'marginRight' : '10px', 'color': '#52CA19'}}></i>
)
const PAUSE_ICON = (
  <i className='fa fa-lg fa-pause'
     style={{'marginRight' : '10px', 'color': '#F17B10'}}></i>
)
const PLAY_PAUSE_PADDING = <span style={{paddingRight: '25px'}}/>
// TODO avoid hardcoding attributes (e.g. 'title') here

export class Name extends React.Component {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'title', update)
  }

  render() {
    const { sample, playId, isPlaying, editable } = this.props

    let playPauseIcon
    let playPausePadding
    if (playId === sample.playId) {
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
      <ContentEditable onChange={this.emitChange}
                       editable={editable}
                       html={sample.title}/>
      {playPausePadding}
    </td>
    )
  }
}

export class State extends React.Component {
  renderIcon(iconClasses) {
    return <i className={`fa fa-lg ${iconClasses}`}></i>
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
        return (
          <React.Fragment>
            {`${sample.uploadProgress}%`}
          </React.Fragment>
        )
      default:
        return this.renderIcon('fa-check-circle common-table-status-ok')
    }
  }

  render() {
    return (
      <td className='common-columns-small-screen-hide'>
        {this.renderRow()}
      </td>
    )
  }
}

export class Time extends React.Component {
  render() {
    const { sample } = this.props
    return (
      <td className='common-columns-small-screen-hide'>{sample.time}</td>
    )
  }
}

export class Artist extends React.Component {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'artist', update)
  }

  render() {
    const {sample, editable } = this.props
    return (
      <td>
        <ContentEditable onChange={this.emitChange}
                         editable={editable}
                         html={sample.artist}/>
      </td>
    )
  }
}

export class Album extends React.Component {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'album', update)
  }

  render() {
    const { sample, editable } = this.props
      return (
        <td>
          <ContentEditable onChange={this.emitChange}
                           editable={editable}
                           html={sample.album}/>
        </td>
      )
    }
}

export class Genre extends React.Component {
  emitChange = update => {
    const { onChange, sample } = this.props
    onChange(sample.id, 'genre', update)
  }

  render() {
    const { sample, editable } = this.props
    return (
      <td>
        <ContentEditable onChange={this.emitChange}
                         editable={editable}
                         html={sample.genre}/>
      </td>
    )
  }
}

export class CreatedAt extends React.Component {
  render() {
    const { sample } = this.props
    return (
      <td className='common-columns-small-screen-hide'>{sample.createdAtPretty}</td>
    )
  }
}
