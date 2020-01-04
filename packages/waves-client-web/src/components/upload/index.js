import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'
import {
  UPLOADS_NAME as playlistName,
  modalTypes
} from 'waves-client-constants'
import { getOrCreatePlaylistSelectors } from 'waves-client-selectors'

import ContentPage from '../contentpage'
import Table from '../table'
import { uploadColumns } from '../table/columns'
import processTrack from './processTrack'

// import defaultTrackLogoUrl from './default-track-image.png'
import './index.css'

const ACCEPTED_FILE_TYPES = 'audio/mp3,audio/mpeg'
const ACCEPTED_FILE_TYPE_LIST = ['audio/mp3', 'audio/mpeg']

class Upload extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { dragging: false, uploading: false }
  }

  onUpload = async () => {
    const { actions } = this.props
    actions.modalSet({ type: modalTypes.TRACKS_UPLOAD })
  }

  onDragEnter = ev => {
    this.setState({ dragging: true })
    ev.preventDefault()
  }

  onDragLeave = () => {
    this.setState({ dragging: false })
  }

  // Needed preventDefault on dragenter, dragover, and ondrop events
  // https://stackoverflow.com/questions/8414154/
  // html5-drop-event-doesnt-work-unless-dragover-is-handled
  onDragOver = ev => {
    ev.preventDefault()
  }

  validateDropFileType = f => {
    if (ACCEPTED_FILE_TYPE_LIST.indexOf(f.type) > -1) {
      return true
    }
    const { actions } = this.props
    actions.toastErr(`${f.name}: Invalid file type`)
    return false
  }

  onDrop = ev => {
    ev.preventDefault()
    this.setState({ dragging: false })
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const files = Array.from(ev.dataTransfer.files).filter(
      this.validateDropFileType
    )

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
      const { actions } = this.props
      actions.toastErr(`${file.name}: Failed to read track info: ${err}`)
      console.log(err)
      console.log(err.stack)
    }
    return null
  }

  processFiles = async files => {
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const newUploads = await Promise.all(
      Array.from(files, this.wrapProcessTrack, this)
    )
    const validNewUploads = newUploads.filter(upload => upload != null)

    const { actions, numItems, rowsPerPage } = this.props
    if (numItems + validNewUploads.length > rowsPerPage) {
      /* TODO look into command line utility */
      actions.toastErr(`Cannot upload more than ${rowsPerPage} items`)
      return
    }
    actions.tracksAdd(validNewUploads, playlistName)
  }

  onItemEdit = (id, key, value) => {
    const { actions } = this.props
    actions.tracksLocalInfoUpdate(id, key, value, playlistName)
  }

  renderUploads() {
    const { loaded, numItems } = this.props
    if (!loaded || numItems === 0) {
      return null
    }
    const {
      columns,
      index,
      selection,
      displayItems,
      pathname,
      qp,
      actions,
      isPlaying,
      layout,
      currentPage,
      lastPage
    } = this.props
    return (
      <Table
        actions={actions}
        columns={columns}
        currentPage={currentPage}
        lastPage={lastPage}
        draggable={false}
        orderable={false}
        isPlaying={isPlaying}
        pathname={pathname}
        qp={qp}
        displayItems={displayItems}
        numItems={numItems}
        onItemEdit={this.onItemEdit}
        index={index}
        layout={layout}
        selection={selection}
        playlistName={playlistName}
      />
    )
  }

  render() {
    let dropZoneClass = 'upload-drop-zone'
    if (this.state.dragging) {
      dropZoneClass += ' upload-drop-zone-dragging'
    }

    const uploads = this.renderUploads()

    // TODO add progress bar?
    return (
      <ContentPage title='Upload Files'>
        <div>
          <h4>Select files from your device</h4>
          <form>
            <div>
              <input
                type='file'
                className='upload-file-input'
                name='uploads[]'
                multiple
                accept={ACCEPTED_FILE_TYPES}
                onChange={this.onFileSelect}
              />
              <button
                type='button'
                className='btn btn-sm btn-primary'
                disabled={uploads == null || this.state.uploading}
                onClick={this.onUpload}
              >
                {this.state.uploading ? 'Uploading' : 'Upload files'}
              </button>
            </div>
          </form>

          <h4>Or drag and drop files below</h4>
          <div
            className={dropZoneClass}
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave}
            onDragOver={this.onDragOver}
            onDrop={this.onDrop}
          >
            Just drag and drop files here
          </div>
          {uploads}
        </div>
      </ContentPage>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const {
    getRouterQueryParams,
    getPlaylistProps
  } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams, playlistName)
  const { account, layout, tracks } = state
  const { playing } = tracks
  const { isPlaying } = playing
  const { location } = ownProps
  const { pathname, search } = location
  const columns = uploadColumns.filter(c => account.columns.has(c.title))
  return {
    rowsPerPage: account.rowsPerPage,
    pathname,
    qp: getRouterQueryParams(undefined, search),
    isPlaying,
    columns,
    layout,
    ...getPlaylistProps(state, search)
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
