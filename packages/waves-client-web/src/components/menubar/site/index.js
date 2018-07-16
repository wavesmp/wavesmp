import React from 'react'
import { Link } from 'react-router-dom'

import './index.css'
import GithubCorner from './githubCorner'
import logoUrl from '../common/logo-wide.svg'

const SITE_PATH = '/'


export default class MenuBar extends React.Component {
  render() {
    return (
      <header>
        <Link to={SITE_PATH} className='menubar-site-logos'>
          <img className='menubar-site-logo' src={logoUrl}/>
          <span className='menubar-site-logo-name'>WAVES</span>
        </Link>
        <GithubCorner/>
      </header>
    )
  }
}

