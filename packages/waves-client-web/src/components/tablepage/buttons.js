import React from 'react'

export default class Buttons extends React.PureComponent {
  render() {
    const { buttons } = this.props
    if (!buttons) {
      return null
    }
    return (
      <div className='pull-left'>
        <div className='tablemenubar-buttons'>
          {buttons.map(sample => (
            <button
              key={sample.name}
              className='btn btn-primary'
              onClick={sample.onClick}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>
    )
  }
}
