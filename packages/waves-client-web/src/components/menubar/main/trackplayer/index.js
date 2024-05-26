import React from 'react'

import Options from './options'
import Player from './player'
import './index.css'

export default class TrackPlayer extends React.PureComponent {
  render() {
    const {
      menubar,
      filteredSelection,
      playlistName,
      index,
      actions,
      playing,
    } = this.props
    if (menubar) {
      return (
        <Options
          actions={actions}
          filteredSelection={filteredSelection}
          playlistName={playlistName}
          index={index}
        />
      )
    }
    return <Player actions={actions} playing={playing} />
  }
}
