import React from 'react'

import './trackslider.css'

export default class TrackSlider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      seeking: false,
      seekingValue: 0
    }
  }

  onMouseDown = ev => {
    this.setState({seeking: true})
  }

  onChange = ev => {
    this.setState({seekingValue: ev.currentTarget.value})
  }

  onMouseUp = ev => {
    const { actions, playing } = this.props
    const { track } = playing
    const { duration } = track
    this.setState({seeking: false})
    actions.seek(ev.target.value * duration)
  }


  getValue() {
    if (this.state.seeking) {
      return this.state.seekingValue
    }

    const { playing } = this.props
    const { track, currentTime } = playing
    const { duration } = track
    return currentTime / duration
  }

  render() {
    const value = this.getValue()
    return (
        <input type="range" min="0.0" max="1.0" step='0.001'
               value={value}
               onMouseDown={this.onMouseDown}
               onMouseUp={this.onMouseUp}
               onChange={this.onChange}
               className='trackslider'/>
    )
  }
}
