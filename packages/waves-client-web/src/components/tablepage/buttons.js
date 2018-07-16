import React from 'react'

export default class Buttons extends React.Component {
  render() {
    const { buttons } = this.props
    if (!buttons) {
      return null
    }
    return (
      <div className='pull-left'>
        <div className='tablemenubar-buttons'>
          {buttons.map(sample => (
              <label key={sample.name}
                  className='btn btn-primary'
                  onClick={sample.onClick}>
                {sample.name}
              </label>
            ))
          }
        </div>
      </div>
    )
  }
}

