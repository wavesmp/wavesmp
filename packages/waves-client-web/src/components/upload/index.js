/* TODO works for small number of items, but needs
 * to be improved for large bulk uploads
 * e.g. modal is not paginated. Also, search should
 * be disabled explicitly */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as WavesActions from 'waves-client-actions'
import {
  UPLOAD_PLAYLIST as playlistName,
  modalTypes,
  toastTypes
} from 'waves-client-constants'
import { getOrCreatePlaylistSelectors } from 'waves-client-selectors'

import ContentPage from '../contentpage'
import { onRowDoubleClick } from '../playlist/tableActions'
import Table from '../table'
import { uploadColumns } from '../table/columns'
import processTrack from './processTrack'

import defaultTrackLogoUrl from './default-track-image.png'
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

  onDragLeave = ev => {
    this.setState({ dragging: false })
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
    const { actions } = this.props
    actions.toastAdd({
      type: toastTypes.Error,
      msg: `${f.name}: Invalid file type`
    })
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
  wrapProcessTrack = async file => {
    try {
      return await processTrack(file)
    } catch (err) {
      const { actions } = this.props
      actions.toastAdd({
        type: toastTypes.Error,
        msg: `${f.name}: Failed to read track info: ${err}`
      })
      console.log(err)
      console.log(err.stack)
    }
    return null
  }

  processFiles = async files => {
    // files (type FileList) is not an array, so can't use map.
    // Use Array.from(arrayLikeObj, mapFn) as a workaround
    const newUploads = await Promise.all(
      Array.from(files, this.wrapProcessTrack)
    )
    const validNewUploads = newUploads.filter(upload => upload != null)

    // TODO remove me
    console.log('AWAITED NEW UPLOADS')
    console.log(validNewUploads)

    const { actions } = this.props
    actions.trackUploadsUpdate(validNewUploads)
  }

  onItemEdit = (id, key, value) => {
    const { actions } = this.props
    actions.uploadInfoUpdate(id, key, value)
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
      playing,
      transitions,
      currentPage,
      lastPage
    } = this.props
    return (
      <Table
        actions={actions}
        columns={columns}
        currentPage={currentPage}
        lastPage={lastPage}
        displayItems={displayItems}
        draggable={false}
        isPlaying={playing.isPlaying}
        pathname={pathname}
        qp={qp}
        currentPage={currentPage}
        displayItems={displayItems}
        lastPage={lastPage}
        numItems={numItems}
        onItemEdit={this.onItemEdit}
        onRowDoubleClick={onRowDoubleClick(actions, playlistName)}
        index={index}
        transitions={transitions}
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
        transitions={transitions}
      >
        <div>
          <h4>Select files from your computer</h4>
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
  } = getOrCreatePlaylistSelectors(playlistName, URLSearchParams, 'uploads')
  const { account, sidebar, transitions, tracks } = state
  const { playing, uploads } = tracks
  const { location } = ownProps
  const { pathname, search } = location
  const columns = uploadColumns.filter(c => account.columns.has(c.title))
  return {
    pathname,
    qp: getRouterQueryParams(undefined, search),
    uploads,
    playing,
    columns,
    sidebar,
    transitions,
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
