// TODO improvements
// - display track image

import Promise from 'bluebird'
import formatTime from 'format-duration'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'
import { UPLOAD_PLAYLIST as playlistName } from 'waves-client-constants'
import { getOrCreatePlaylistSelectors } from 'waves-client-selectors'

import ContentPage from '../contentpage'
import { onRowDoubleClick } from '../playlist/tableActions'
import Table from '../table'
import { playlistColumns } from '../table/columns'
import processTrack from './processTrack'

import defaultTrackLogoUrl from './default-track-image.png'
import './index.css'

const ACCEPTED_FILE_TYPES = 'audio/mp3,audio/mpeg'
const ACCEPTED_FILE_TYPE_LIST = ['audio/mp3', 'audio/mpeg']

class Upload extends React.Component {
  constructor(props) {
    super(props)
    this.state = { dragging: false, uploading: false }
  }

  onUpload = async () => {
    const { actions } = this.props
    this.setState({uploading: true})
    await actions.tracksUpload('s3')
    this.setState({uploading: false})
  }

  onDragEnter = ev => {
    this.setState({dragging: true})
    ev.preventDefault()
  }

  onDragLeave = ev => {
    this.setState({dragging: false})
  }

  // Needed preventDefault on dragenter, dragover, and ondrop events
  // https://stackoverflow.com/questions/8414154/html5-drop-event-doesnt-work-unless-dragover-is-handled
  onDragOver = ev => {
    ev.preventDefault()
  }

  validateDropFileType = f => {
    if (ACCEPTED_FILE_TYPE_LIST.indexOf(f.type) > -1) {
      return true
    }
    toastr.error(f.name, 'Invalid file type')
    return false
  }

  onDrop = ev => {
    ev.preventDefault()
    this.setState({dragging: false})
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const files = Array.from(ev.dataTransfer.files)
      .filter(this.validateDropFileType)

    if (files.length === 0) {
      return
    }
    this.processFiles(files)
  }

  onFileSelect = ev => {
    /* Files should only be valid types due to the input accept clause */
    const files = ev.currentTarget.files
    this.processFiles(files)
  }

  /* Wrap the processTrack call, and handle errors */
  async wrapProcessTrack(file) {
    try {
      return await processTrack(file)
    } catch (err) {
      toastr.error(err.toString(), `Failed to read track info: ${file.name}`)
      console.log(err)
      console.log(err.stack)
    }
    return null
  }

  processFiles = async files => {
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const newUploads = await Promise.all(Array.from(files, this.wrapProcessTrack))
    const validNewUploads = newUploads.filter(upload => upload != null)

    // TODO remove me
    console.log('AWAITED NEW UPLOADS')
    console.log(validNewUploads)

    const { actions } = this.props
    actions.trackUploadsUpdate(validNewUploads)
  }

  getDisplayItems = (startIndex, stopIndex) => {
    const { playlist, uploads } = this.props
    const { tracks } = playlist
    const { length } = tracks

    const displayItems = []
    for (let i = startIndex; i < stopIndex && i < length; i += 1) {
      const track = uploads[tracks[i]]
      const time = formatTime(1000 * track.duration)
      displayItems.push({...track, time, playId: i + ''})
    }
    return displayItems
  }

  onItemEdit = (id, attr, update) => {
    const { actions } = this.props
    actions.uploadInfoUpdate(id, attr, update)
  }

  renderUploads() {
    const { playlist } = this.props
    if (!playlist) {
      return null
    }
    const { playId, selection, tracks } = playlist
    const { length: numItems } = tracks
    if (numItems === 0) {
      return null
    }

    const { account, location, actions, playing, transitions } = this.props
    const { isPlaying } = playing
    const { rowsPerPage } = account
    const columns = playlistColumns.filter(c => account.columns.has(c.title))
    return (
      <Table
        actions={actions}
        columns={columns}
        draggable={false}
        getDisplayItems={this.getDisplayItems}
        isPlaying={isPlaying}
        location={location}
        numItems={numItems}
        onItemEdit={this.onItemEdit}
        onRowDoubleClick={onRowDoubleClick(actions, playlistName)}
        playId={playId}
        transitions={transitions}
        rowsPerPage={rowsPerPage}
        selection={selection}
        playlistName={playlistName}
      />
    )
  }

  render() {
    const { playing, actions, sidebar, transitions } = this.props

    let dropZoneClass = 'upload-drop-zone'
    if (this.state.dragging) {
      dropZoneClass += ' upload-drop-zone-dragging'
    }

    const uploads = this.renderUploads()

    // TODO add progress bar?
    return (
      <ContentPage
          title={'Upload Files'}
          sidebar={sidebar}
          isPlayerVisible={playing.track !== null}
          transitions={transitions}>
        <div>
          <h4 style={{marginTop: '15px'}}>Select files from your computer</h4>
          <form>
            <div>
              <input type='file'
                className='upload-file-input'
                name='uploads[]'
                multiple accept={ACCEPTED_FILE_TYPES}
                onChange={this.onFileSelect}/>
              <button
                type='button'
                className='btn btn-sm btn-primary'
                disabled={uploads == null || this.state.uploading}
                onClick={this.onUpload}>{this.state.uploading ? 'Uploading' : 'Upload files'}</button>
            </div>
          </form>

          <h4>Or drag and drop files below</h4>
          <div className={dropZoneClass}
              onDragEnter={this.onDragEnter}
              onDragLeave={this.onDragLeave}
              onDragOver={this.onDragOver}
              onDrop={this.onDrop}>
            Just drag and drop files here
          </div>
          {uploads}
        </div>
      </ContentPage>
    )
  }
}

function mapStateToProps(state) {
  const { getPlaylist } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams)
  const { account, sidebar, transitions, tracks } = state
  const { library, playing, uploads } = tracks
  return {
    playlist: getPlaylist(tracks),
    uploads,
    library,
    playing,
    account,
    sidebar,
    transitions
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Upload)
