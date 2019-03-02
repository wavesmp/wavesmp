import React from 'react'

import './pageheader.css'

export default class PageHeader extends React.PureComponent {
  render() {
    const { title } = this.props
    return (
      <div className='common-pageheader'>
        <h1>{title}</h1>
      </div>
    )
  }
}
