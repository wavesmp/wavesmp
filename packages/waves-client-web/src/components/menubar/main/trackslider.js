import React from 'react'

import './trackslider.css'

export default class TrackSlider extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      seeking: false,
      seekingValue: 0,
      currentTime: 0,
    }
  }

  onTimeUpdate = (ev) => {
    const { currentTime } = ev.currentTarget
    this.setState({ currentTime })
  }

  componentDidMount() {
    const { actions } = this.props
    actions.addOnTimeUpdate(this.onTimeUpdate)
  }

  componentWillUnmount() {
    const { actions } = this.props
    actions.removeOnTimeUpdate(this.onTimeUpdate)
  }

  onMouseDown = () => {
    this.setState({ seeking: true })
  }

  onChange = (ev) => {
    this.setState({ seekingValue: ev.currentTarget.value })
  }

  onMouseUp = (ev) => {
    const { actions, playing } = this.props
    const { duration } = playing.track
    const currentTime = ev.target.value * duration
    actions.seek(currentTime)
    this.setState({ seeking: false, currentTime })
  }

  getValue() {
    const { seeking, seekingValue, currentTime } = this.state
    if (seeking) {
      return seekingValue
    }
    /* eslint-disable-next-line react/destructuring-assignment */
    const { playing } = this.props
    return currentTime / playing.track.duration
  }

  render() {
    const value = this.getValue()
    return (
      <input
        type='range'
        min='0.0'
        max='1.0'
        step='0.001'
        value={value}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onTouchStart={this.onMouseDown}
        onTouchEnd={this.onMouseUp}
        onChange={this.onChange}
        className='trackslider'
      />
    )
  }
}
