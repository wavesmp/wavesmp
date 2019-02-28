import React from 'react'
import { Link } from 'react-router-dom'

import GithubCornerSvg from './github-corner-right.svg'

export default class GithubCorner extends React.Component {
  render() {
    return (
      <a
        className='absolute-top-right'
        href='https://github.com/wavesmp/wavesmp'
      >
        <GithubCornerSvg />
      </a>
    )
  }
}
