import React from 'react'

import './pageheader.css'

export default class PageHeader extends React.Component {
  render() {
    const { title } = this.props
    return (
      <div className='common-pageheader'>
        <h1>{title}</h1>
      </div>
    )
  }
}
