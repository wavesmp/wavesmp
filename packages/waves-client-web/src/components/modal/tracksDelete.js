import formatTime from 'format-duration'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { FULL_PLAYLIST } from 'waves-client-constants'

import Modal from './util'
import { libraryColumns } from '../table/columns'

class TracksDeleteModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { deleting: false }
  }

  onDelete = async () => {
    const { actions } = this.props
    this.setState({ deleting: true })
    const { deleteErrs, serverErrs } = await actions.tracksDelete()
    this.setState({ deleting: false })
    return deleteErrs.length === 0 && serverErrs.length === 0
  }

  parsePlayId(playId) {
    return parseInt(playId, 10)
  }

  renderDeleteItems() {
    const { columns, isPlaying, library, playId, selection } = this.props
    const itemPlayIds = Object.keys(selection).map(this.parsePlayId)
    itemPlayIds.sort((a, b) => a - b)
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
              {itemPlayIds.map(itemPlayId => {
                // TODO refactor with Library
                let sample = library[selection[itemPlayId]]
                const time = formatTime(1000 * sample.duration)
                sample = { ...sample, time, playId: itemPlayId + '' }
                return (
                  <tr key={itemPlayId}>
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
    const { actions, selection } = this.props
    const { deleting } = this.state
    const deleteTitle = deleting ? 'Deleting' : 'Delete'
    const plurality = hasMoreThanOne(selection) ? 's' : ''
    const title = 'Delete track' + plurality
    const message = `This will delete the track${plurality} below. Are you sure?`
    return (
      <Modal
        actions={actions}
        deleteTitle={deleteTitle}
        disabled={deleting}
        title={title}
        onDelete={this.onDelete}
      >
        <div>
          <span>{message}</span>
        </div>
        {this.renderDeleteItems()}
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
  const { library, playlists, playing } = tracks
  const playlist = playlists[FULL_PLAYLIST]
  const { playId, selection } = playlist
  const { isPlaying } = playing
  const columns = libraryColumns.filter(c => account.columns.has(c.title))
  return {
    columns,
    library,
    selection,
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
)(TracksDeleteModal)
