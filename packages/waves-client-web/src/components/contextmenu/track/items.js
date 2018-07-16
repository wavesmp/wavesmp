import React from 'react'

import constants from 'waves-client-constants'


export const LibraryDelete = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconDeleteColor}} className='fa fa-lg fa-trash-o'></i>
    &nbsp;&nbsp;Delete
  </React.Fragment>
)

export const PlaylistRemove = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconRemoveColor}} className='fa fa-lg fa-times'></i>
    &nbsp;&nbsp;Remove
  </React.Fragment>
)

export const Download = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconDownloadColor}}
       className='fa fa-lg fa-download'></i>
    &nbsp;&nbsp;Download
  </React.Fragment>
)

export const PlaylistAdd = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconAddColor}} className='fa fa-lg fa-plus-circle'></i>
    &nbsp;&nbsp;Add to Playlist...
  </React.Fragment>
)

export const Back = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconBackColor}}
       className='fa fa-lg fa-chevron-circle-left'></i>
    &nbsp;&nbsp;Back
  </React.Fragment>
)

export const NowPlayingAdd = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconAddColor}} className='fa fa-lg fa-plus'></i>
    &nbsp;&nbsp;Add to Now Playing
  </React.Fragment>
)


export const Play = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconPlayColor}} className='fa fa-lg fa-play'></i>
    &nbsp;&nbsp;Play
  </React.Fragment>
)

export const Pause = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconPauseColor}} className='fa fa-lg fa-pause'></i>
    &nbsp;&nbsp;Pause
  </React.Fragment>
)

export const PlayResume = createContextMenuItem(
  <React.Fragment>
    <i style={{color: constants.iconPlayColor}} className='fa fa-lg fa-play-circle'></i>
    &nbsp;&nbsp;Resume
  </React.Fragment>
)

function createContextMenuItem(Component) {
  return class extends React.Component {
    render() {
      const { onClick } = this.props
      return (
        <li className='btn btn-default contextmenu-item' onClick={onClick}>
            {Component}
        </li>
      )
    }
  }
}

// TODO PlaylistAdd item accepts a name.. try to refactor with other components
export class PlaylistAddItem extends React.Component {
  render() {
    const { onClick, title } = this.props
    return (
      <li className='contextmenu-item'>
        <div className='btn btn-default contextmenu-link' onClick={onClick}>
        <div>
          <i className='fa fa-fw fa fa-lg fa-list'></i>
          &nbsp;&nbsp;{title}
        </div>
        </div>
      </li>
    )
  }
}














//
//
//
//
// export function convertToMp3() {
//   return {
//     component: convertToMp3Component,
//     handleAction: unsupportedFeature
//   }
// }
//
// const convertToMp3Component = (<div>
//   <i style={{color: constants.iconDownloadColor}} className='fa fa-lg fa-exchange'></i>
//   &nbsp;&nbsp;Convert to MP3
// </div>)
//

// export function libraryImport(actions, trackId) {
//   var importActions = [{
//     component: backComponent,
//     handleAction: ev => {
//       actions.contextmenuBack()
//       ev.preventDefault()
//       ev.stopPropagation()
//     }
//   },
//   {
//     component: importYouTubeComponent,
//     handleAction: ev => actions.libraryImport(trackId, false)
//   },
//   {
//     component: importMp3Component,
//     handleAction: ev => actions.libraryImport(trackId, true)
//   }]
//   return {
//     component: importComponent,
//     handleAction: ev => {
//       actions.contextmenuNext(importActions)
//       ev.preventDefault()
//       ev.stopPropagation()
//     }
//   }
// }
//
// const importComponent = (<div>
//   <i style={{color: constants.iconDownloadColor}} className='fa fa-lg fa-cloud-upload'></i>
//   &nbsp;&nbsp;Import to Library...
// </div>)
// const importYouTubeComponent = (<div>
//   <i style={{color: '#e62117'}} className='fa fa-lg fa-youtube-play'></i>
//   &nbsp;&nbsp;Import as Video
// </div>)
// const importMp3Component = (<div>
//   <i style={{color: constants.iconDownloadColor}} className='fa fa-lg fa-file-audio-o'></i>
//   &nbsp;&nbsp;Import as MP3
// </div>)



// function unsupportedFeature() {
//   toastr.error('Upgrade to PRO to unlock!', 'Feature Unavailable')
// }
//
// function createContextMenuLink(Component) {
//   return class extends React.Component {
//     render() {
//       const { href } = this.props
//       return (
//         <li className='contextmenu-item'>
//           <a href={href} className='btn-default contextmenu-link'>
//             <Component/>
//           </a>
//         </li>
//       )
//     }
//   }
// }
//
