import React from 'react'

import './userInput.css'


export default class UserInput extends React.Component {
  render() {
    let iconClass = 'fa fa-lg fa-fw common-tablemenubar-input-icon site-input-icon '
    const { placeholder, iconClass: additionalIconClass } = this.props
    if (additionalIconClass) {
      iconClass += additionalIconClass
    }

    return (
      <div className='site-input-box'>
        <i className={iconClass}></i>
        <input type='text' className='site-input' placeholder={placeholder}/>
      </div>
    )
  }
}
