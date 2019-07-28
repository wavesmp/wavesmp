import React from 'react'

import { bindActionCreators } from 'redux'
import * as WavesActions from 'waves-client-actions'
import { toastTypes } from 'waves-client-constants'
import './trackplayer.css'

const MAX_TITLE_LEN = 21
const MAX_ARTIST_LEN = 28

class TrackInfo extends React.PureComponent {
  shorten(s, maxLength) {
    if (s && s.length > maxLength) {
      return s.substring(0, maxLength + 1)
    }
    return s
  }

  render() {
    const trackTitle = this.shorten(this.props.trackTitle, MAX_TITLE_LEN)
    const trackArtist = this.shorten(this.props.trackArtist, MAX_TITLE_LEN)
    return (
      <div className='trackplayer trackplayer-info'>
        <p className='trackplayer-info-title'>{trackTitle}</p>
        <p className='trackplayer-info-artist'>{trackArtist}</p>
      </div>
    )
  }
}

class LeftButtons extends React.PureComponent {
  onTrackNext = () => {
    const { actions } = this.props
    actions.trackNext(URLSearchParams)
  }

  onTrackPrevious = () => {
    const { actions } = this.props
    actions.trackPrevious(URLSearchParams)
  }

  render() {
    const { playing, actions } = this.props
    const { isPlaying } = playing
    let playOrPauseClass
    let onPlayPauseClick
    if (isPlaying) {
      playOrPauseClass = 'fa fa-lg fa-pause trackplayer-btn-lg'
      onPlayPauseClick = actions.pause
    } else {
      playOrPauseClass = 'fa fa-lg fa-play trackplayer-btn-lg'
      onPlayPauseClick = actions.play
    }
    return (
      <div className='trackplayer trackplayer-left'>
        <span className='trackplayer-left-btns'>
          <i
            className='fa fa-backward trackplayer-btn'
            onClick={this.onTrackPrevious}
          />
          <i className={playOrPauseClass} onClick={onPlayPauseClick} />
          <i
            className='fa fa-forward trackplayer-btn'
            onClick={this.onTrackNext}
          />
        </span>
      </div>
    )
  }
}

class RightButtons extends React.PureComponent {
  onShuffleClick = ev => {
    const { playing, actions } = this.props
    const { shuffle } = playing
    actions.shuffleToggle()
    const msg = `Shuffle ${shuffle ? 'Dis' : 'En'}abled`
    actions.toastAdd({ type: toastTypes.Success, msg })
  }

  onRepeatClick = ev => {
    const { playing, actions } = this.props
    const { repeat } = playing
    actions.repeatToggle()
    const msg = `Repeat ${repeat ? 'Dis' : 'En'}abled`
    actions.toastAdd({ type: toastTypes.Success, msg })
  }

  render() {
    const { playing } = this.props
    const { repeat, shuffle } = playing

    let repeatButtonClass = 'fa fa-repeat trackplayer-btn'
    if (repeat) {
      repeatButtonClass += ' trackplayer-btn-active'
    }

    let shuffleButtonClass = 'fa fa-random trackplayer-btn'
    if (shuffle) {
      shuffleButtonClass += ' trackplayer-btn-active'
    }
    return (
      <div className='trackplayer trackplayer-right'>
        <span className='trackplayer-right-btns'>
          <i className={shuffleButtonClass} onClick={this.onShuffleClick} />
          <i className={repeatButtonClass} onClick={this.onRepeatClick} />
        </span>
      </div>
    )
  }
}

export default class TrackPlayer extends React.PureComponent {
  render() {
    const { playing, actions } = this.props
    const { track } = playing
    return (
      <React.Fragment>
        <TrackInfo trackTitle={track.title} trackArtist={track.artist} />
        <LeftButtons playing={playing} actions={actions} />
        <RightButtons playing={playing} actions={actions} />
      </React.Fragment>
    )
  }
}
