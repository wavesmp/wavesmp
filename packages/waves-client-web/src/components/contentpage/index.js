import React from 'react'

import './index.css'

export default class ContentPage extends React.PureComponent {
  render() {
    const { title, sidebar, isPlayerVisible, transitions } = this.props
    let className
    if (transitions) {
      className = 'contentpage-container-transition '
    } else {
      className = ''
    }
    className += 'contentpage-container contentpage-container-'
    if (sidebar !== 'main') {
      className += 'wide'
    } else {
      className += 'narrow'
    }
    if (isPlayerVisible) {
      className += ' contentpage-container-player-visible'
    }
    return (
      <div className={className}>
        <div className='contentpage-panel'>
          <div className='contentpage-title'>
            <h1>{title}</h1>
          </div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
