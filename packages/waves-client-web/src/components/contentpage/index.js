import React from 'react'
import { connect } from 'react-redux'

import './index.css'

class ContentPage extends React.PureComponent {
  render() {
    const { title, sidebar, isPlayerVisible, layout } = this.props
    let className
    /* Usually, transitions are enabled on this element. However,
     * disable the transitions when moving from layouts, so that
     * the element can snap into place. Adding a new transition
     * for this case would conflict with the current one, so handle
     * it programmatically (no pure-CSS solution available AFAIK) */
    if (layout > 1) {
      className = 'contentpage-container-transition '
    } else {
      className = ''
    }
    className += 'contentpage-container contentpage-container-'
    if (sidebar) {
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

function mapStateToProps(state) {
  const { layout, tracks, sidebar } = state
  return {
    layout,
    isPlayerVisible: tracks.playing.track != null,
    sidebar
  }
}

export default connect(mapStateToProps)(ContentPage)
