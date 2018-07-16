import React from 'react'
import { Link } from 'react-router-dom'

import githubCornerSvg from './github-corner-right.svg'


export default class GithubCorner extends React.Component {
  render() {
    return (
      <a className='absolute-top-right'
         href='https://github.com/wavesmp'>
        <img src={githubCornerSvg}/>
      </a>
    )
  }
}
