import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { UPLOAD_PLAYLIST as playlistName } from 'waves-client-constants'

import Modal from './util'
import { playlistColumns } from '../table/columns'
import { normalizeTrack } from '../../util'

class TracksUploadModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { uploading: false }
  }

  onUpload = async () => {
    const { actions } = this.props
    this.setState({ uploading: true })
    const { uploadErrs, serverErr } = await actions.tracksUpload()
    this.setState({ uploading: false })
    return uploadErrs.length === 0 && !serverErr
  }

  renderUploadItems() {
    const { playlist } = this.props
    const { tracks } = playlist
    const { columns, isPlaying, uploads, index } = this.props
    return (
      <div>
        <div>
          <table className='table modal-table'>
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={column.title}>{column.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, i) => (
                <tr key={track}>
                  {columns.map(column => (
                    <column.Component
                      key={column.title}
                      isPlaying={isPlaying}
                      index={index}
                      sample={normalizeTrack(uploads[track], i)}
                      editable={false}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  render() {
    const { uploading } = this.state
    const { actions, uploads } = this.props
    const plurality = hasMoreThanOne(uploads) ? 's' : ''
    const message = `This will upload the track${plurality} below.`
    return (
      <Modal
        actions={actions}
        title={`Upload track${plurality}`}
        actionTitle={uploading ? 'Uploading' : 'Upload'}
        disabled={uploading}
        onAction={this.onUpload}
      >
        <div>
          <span>{message}</span>
        </div>
        {this.renderUploadItems()}
      </Modal>
    )
  }
}

function hasMoreThanOne(obj) {
  let i = 0
  for (const key in obj) {
    if (i > 0) {
      return true
    }
    i += 1
  }
  return false
}

function mapStateToProps(state) {
  const { account, tracks } = state
  const { playing, playlists, uploads } = tracks
  const playlist = playlists[playlistName]
  const { index } = playlist
  const columns = playlistColumns.filter(
    c => account.columns.has(c.title) && c.title !== 'Created At'
  )
  const { isPlaying } = playing
  return {
    playlist,
    columns,
    uploads,
    isPlaying,
    index
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
)(TracksUploadModal)
