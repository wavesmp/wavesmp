import React from 'react'

import wmpImgUrl from './wmp.png'

export default class Preview extends React.PureComponent {
  render() {
    return (
      <div className='site-main-right'>
        <div className='site-main-browser'>
          <div className='site-main-browser-bar'>
            <div className='site-main-browser-close' />
            <div className='site-main-browser-min' />
            <div className='site-main-browser-max' />
          </div>
          <img src={wmpImgUrl} className='site-main-browser-img' />
        </div>
      </div>
    )
  }
}
