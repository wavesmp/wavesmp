import React from 'react'

import PageHeader from './pageheader'
import './index.css'

export default class ContentPage extends React.Component {
  render() {
    const { title, sidebar, isPlayerVisible,
            transitions, ...other } = this.props
    let className
    if (transitions) {
      className = 'mainpage-container-transition '
    } else {
      className = ''
    }
    className += 'mainpage-container mainpage-container-'
    if (sidebar !== 'main') {
      className += 'wide'
    } else {
      className += 'narrow'
    }
    if (isPlayerVisible) {
      className += ' mainpage-container-player-visible'
    }
    return (
      <div className={className}>
        <div className='contentpage-panel'>
          <PageHeader title={title}/>
          {this.props.children}
        </div>
      </div>
    )
  }
}

