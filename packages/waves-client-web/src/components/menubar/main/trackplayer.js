import React from 'react'

import { bindActionCreators } from 'redux'
import * as WavesActions from 'waves-client-actions'
import './trackplayer.css'

class TrackInfo extends React.Component {
  render() {
    let { trackTitle, trackArtist } = this.props
    const maxTitleLength = 21
    if (trackTitle && trackTitle.length > maxTitleLength) {
      trackTitle = trackTitle.substring(0, maxTitleLength + 1) + '...'
    }
    const maxArtistLength = 28
    if (trackArtist && trackArtist.length > maxArtistLength) {
      trackArtist = trackArtist.substring(0, maxArtistLength + 1) + '...'
    }
    return (
      <div className='trackplayer trackplayer-info'>
        <p className='trackplayer-info-title'>
          {trackTitle}
        </p>
        <p className='trackplayer-info-artist'>
          {trackArtist}
        </p>
      </div>
    )
  }
}

class LeftButtons extends React.Component {
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
      playOrPauseClass = "fa fa-lg fa-pause trackplayer-buttons"
      onPlayPauseClick = actions.pause

    } else {
      playOrPauseClass = "fa fa-lg fa-play trackplayer-buttons"
      onPlayPauseClick = actions.play
    }
    return (
      <div className='trackplayer' style={{transform: 'translate(-160px, 0)', width: '160px'}}>
        <span style={{float: 'left', marginLeft: '20px', marginTop: '9px'}}>
          <i className="fa fa-backward trackplayer-buttons"
             onClick={this.onTrackPrevious} style={{marginTop: '0px',
                                               marginLeft: '5px',
                                               marginRight: '5px'}}></i>
          <i className={playOrPauseClass} onClick={onPlayPauseClick}
                                          style={{marginTop: '10px',
                                                  marginLeft: '5px',
                                                  marginRight: '5px'}}></i>
          <i className="fa fa-forward trackplayer-buttons"
             onClick={this.onTrackNext} style={{marginTop: '0px',
                                              marginLeft: '5px',
                                              marginRight: '5px'}}></i>
        </span>
      </div>
    )
  }
}

class RightButtons extends React.Component {
  onShuffleClick = ev => {
    const { playing, actions } = this.props
    const { shuffle } = playing
    const enabledOrDisabled = (shuffle ? 'Dis' : 'En') + 'abled'
    actions.shuffleToggle()
    toastr.success('Shuffle ' + enabledOrDisabled)
  }

  onRepeatClick = ev => {
    const { playing, actions } = this.props
    const { repeat } = playing
    const enabledOrDisabled = (repeat ? 'Dis' : 'En') + 'abled'
    actions.repeatToggle()
    toastr.success('Repeat ' + enabledOrDisabled)
  }

  render() {
    const { playing } = this.props
    const { repeat, shuffle } = playing

    let repeatButtonClass = 'fa fa-repeat trackplayer-buttons'
    if (repeat) {
      repeatButtonClass += ' trackplayer-button-activated'
    }

    let shuffleButtonClass = 'fa fa-random trackplayer-buttons'
    if (shuffle) {
      shuffleButtonClass += ' trackplayer-button-activated'
    }
    return (
      <div className='trackplayer' style={{width: '160px'}}>
        <span style={{float: 'right', marginRight: '32px', marginTop: '15px'}}>
          <i className={shuffleButtonClass}
             onClick={this.onShuffleClick}
             style={{marginTop: '0px',
                     marginLeft: '5px',
                     marginRight: '5px'}}></i>
          <i className={repeatButtonClass}
             onClick={this.onRepeatClick}
             style={{marginTop: '0px',
                     marginLeft: '5px',
                     marginRight: '5px'}}></i>
        </span>
      </div>
    )
  }
}

export default class TrackPlayer extends React.Component {
  render() {
    const { playing, actions } = this.props
    const { track } = playing
    return (
      <React.Fragment>
        <TrackInfo trackTitle={track.title} trackArtist={track.artist}/>
        <LeftButtons playing={playing} actions={actions}/>
        <RightButtons playing={playing} actions={actions}/>
      </React.Fragment>
    )
  }
}
