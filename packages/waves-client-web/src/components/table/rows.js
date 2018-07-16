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
  getIconClasses(state) {
    switch (state) {
      case 'preview':
        return 'fa-eye'
      case 'importing':
        return 'fa-spinner fa-pulse'
      default:
        return 'fa-check-circle common-table-status-ok'
    }
  }

  render() {
    const { sample } = this.props
    let iconClasses = `fa fa-lg ${this.getIconClasses(sample.state)}`
    return (
      <td className='common-columns-small-screen-hide'>
        <i className={iconClasses}></i>
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
