import React from 'react'

export default class VolumeSlider extends React.PureComponent {
  constructor(props) {
    super(props)
    const { actions } = props
    this.state = { volume: actions.getVolume() }
  }

  onVolumeChange = ev => {
    const { volume } = ev.currentTarget
    this.setState({ volume })
  }

  componentDidMount() {
    this.props.actions.addOnVolumeChange(this.onVolumeChange)
  }

  componentWillUnmount() {
    this.props.actions.removeOnVolumeChange(this.onVolumeChange)
  }

  onVolumeInputChange = ev => {
    const volume = ev.target.valueAsNumber
    const { actions } = this.props
    actions.setVolume(volume)
    this.resetVolumeVal = null
  }

  onResetVolume = () => {
    const { actions } = this.props
    const { volume } = this.state
    if (volume > 0) {
      this.resetVolumeVal = volume
      actions.setVolume(0)
    } else {
      if (this.resetVolumeVal) {
        actions.setVolume(this.resetVolumeVal)
      } else {
        actions.setVolume(0.05)
      }
    }
  }

  render() {
    const { volume } = this.state
    let iconClass = 'fa fa-lg fa-volume-up settings-volume-icon'
    if (volume <= 0) {
      iconClass = 'fa fa-lg fa-volume-off settings-volume-icon'
    } else if (volume < 0.5) {
      iconClass = 'fa fa-lg fa-volume-down settings-volume-icon'
    }

    return (
      <div className='settings-slider-wrapper'>
        <i className={iconClass} onClick={this.onResetVolume} />
        <input
          type='range'
          min='0.0'
          max='1.0'
          step='0.001'
          className='settings-volume-slider'
          value={volume}
          onChange={this.onVolumeInputChange}
        />
      </div>
    )
  }
}
