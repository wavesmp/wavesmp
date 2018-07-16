import React from 'react'

import './trackslider.css'

export default class TrackSlider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      seeking: false,
      value: 0
    }
  }

  updateTrackInfo = () => {
    if (this.state.seeking) {
      return;
    }
    const { playing } = this.props
    const { isPlaying, elapsed, startDate, track } = playing

    if (!isPlaying) {
      // Elapsed is set to 0 when a new track is selected.
      // Handle the case where user pauses, the moves to a new track.
      // Since new track will start at 0, update slider to 0
      // TODO this seems a bit hacky, may want to improve
      if (elapsed === 0 && this.value !== 0) {
        this.setState({value: 0})
      }
      return
    }

    const { duration } = track
    const newElapsed = (new Date() - startDate) / 1000;
    this.setState({value: newElapsed / duration})
  }

  componentDidMount() {
    // TODO optimize the fuck outta this
    // Also, dynamically change interval depending on duration
    setInterval(this.updateTrackInfo, 1000)
  }

  onMouseDown = ev => {
    this.setState({seeking: true})
  }

  onMouseUp = ev => {
    console.log('SEEKING')
    this.setState({seeking: false})
    const { actions, playing } = this.props
    const { track } = playing
    const { duration } = track
    // TODO doesnt seem right to send duration here
    actions.seek(ev.target.value, duration)
  }

  onChange = ev => {
    this.setState({value: ev.currentTarget.value})
  }

  render() {
    return (
        <input type="range" min="0.0" max="1.0" step='0.001'
               value={this.state.value}
               onMouseDown={this.onMouseDown}
               onMouseUp={this.onMouseUp}
               onChange={this.onChange}
               className='trackslider'/>
    )
  }
}
