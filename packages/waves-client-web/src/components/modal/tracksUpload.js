import formatTime from 'format-duration'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { UPLOAD_PLAYLIST as playlistName } from 'waves-client-constants'

import ActionConfirmModal from './actionConfirm'
import { playlistColumns } from '../table/columns'

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
    const { columns, isPlaying, uploads, playId } = this.props
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
              {tracks.map((track, i) => {
                const sample = {
                  ...uploads[track],
                  time: formatTime(1000 * uploads[track].duration),
                  playId: i + ''
                }
                return (
                  <tr key={track}>
                    {columns.map(column => (
                      <column.Component
                        key={column.title}
                        isPlaying={isPlaying}
                        playId={playId}
                        sample={sample}
                        editable={false}
                      />
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  render() {
    const { uploading } = this.state
    const { uploads } = this.props
    const plurality = hasMoreThanOne(uploads) ? 's' : ''
    return (
      <ActionConfirmModal
        title={`Upload track${plurality}`}
        actionTitle={uploading ? 'Uploading' : 'Upload'}
        disabled={uploading}
        message={`This will upload the track${plurality} below.`}
        onAction={this.onUpload}
        additionalRow={this.renderUploadItems()}
      />
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
  const { playId } = playlist
  const columns = playlistColumns.filter(c => account.columns.has(c.title))
  const { isPlaying } = playing
  return {
    playlist,
    columns,
    uploads,
    isPlaying,
    playId
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
