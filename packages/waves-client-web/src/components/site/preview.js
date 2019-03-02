import React from 'react'

import wmpImgUrl from './wmp.png'

export default class Preview extends React.PureComponent {
  render() {
    return (
      <div className='site-main-right'>
        <div className='site-main-browser'>
          <div className='site-main-browser-bar'>
            <div style={{ backgroundColor: '#e34c24' }} />
            <div style={{ backgroundColor: '#e4d735' }} />
            <div style={{ backgroundColor: '#2ad665' }} />
          </div>
          <img src={wmpImgUrl} className='site-main-browser-img' />
        </div>
      </div>
    )
  }
}
