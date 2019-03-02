import React from 'react'

import PageHeader from './pageheader'
import './index.css'

export default class ContentPage extends React.PureComponent {
  render() {
    const {
      title,
      sidebar,
      isPlayerVisible,
      transitions,
      ...other
    } = this.props
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
          <PageHeader title={title} />
          {this.props.children}
        </div>
      </div>
    )
  }
}
