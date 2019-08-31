import React from 'react'

import { contextmenuTypes } from 'waves-client-constants'

class TrackInfo extends React.PureComponent {
  render() {
    const { filteredSelection } = this.props
    return (
      <div className='trackplayer-info-title'>
        {filteredSelection.size} Selected
      </div>
    )
  }
}

class LeftButtons extends React.PureComponent {
  onBack = () => {
    const { actions } = this.props
    actions.menubarSet(false)
  }

  render() {
    return (
      <div className='trackplayer-left'>
        <i
          className='fa fa-lg fa-arrow-left trackplayer-btn'
          onClick={this.onBack}
        />
      </div>
    )
  }
}

class RightButtons extends React.PureComponent {
  onOptionsClick = ev => {
    const { actions, filteredSelection, index, playlistName } = this.props
    if (!filteredSelection || filteredSelection.size === 0) {
      actions.toastErr('No selection found')
      return
    }

    const props = { index, playlistName }
    if (filteredSelection.size === 1) {
      const { value } = filteredSelection.entries().next()
      ;[props.itemIndex, props.trackId] = value
    } else {
      props.bulk = true
    }
    actions.contextmenuSetElem({
      ev,
      type: contextmenuTypes.TRACK,
      props
    })
  }

  render() {
    return (
      <div className='trackplayer-right'>
        <i
          className='fa fa-lg fa-ellipsis-v trackplayer-btn'
          onClick={this.onOptionsClick}
        />
      </div>
    )
  }
}

export default class Options extends React.PureComponent {
  render() {
    const { actions, filteredSelection, index, playlistName } = this.props
    return (
      <div className='trackplayer'>
        <LeftButtons actions={actions} />
        <TrackInfo filteredSelection={filteredSelection} />
        <RightButtons
          actions={actions}
          filteredSelection={filteredSelection}
          index={index}
          playlistName={playlistName}
        />
      </div>
    )
  }
}
