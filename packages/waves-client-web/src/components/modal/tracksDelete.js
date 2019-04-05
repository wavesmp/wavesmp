import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { FULL_PLAYLIST } from 'waves-client-constants'

import Modal from './util'
import { libraryColumns } from '../table/columns'
import { normalizeTrack } from '../../util'

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

  renderDeleteItems() {
    const { columns, isPlaying, library, index, selection } = this.props
    const itemPlayIndexes = Array.from(selection.keys())
    itemPlayIndexes.sort((a, b) => a - b)
    return (
      <div>
        <div>
          <table className='table modal-table'>
            <thead>
              <tr>
                {columns.map(({ title }) => (
                  <th key={title}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemPlayIndexes.map(itemIndex => (
                <tr key={itemIndex}>
                  {columns.map(column => (
                    <column.Component
                      key={column.title}
                      isPlaying={isPlaying}
                      index={index}
                      sample={normalizeTrack(
                        library[selection.get(itemIndex)],
                        itemIndex
                      )}
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
    const { actions, selection } = this.props
    const { deleting } = this.state
    const deleteTitle = deleting ? 'Deleting' : 'Delete'
    const plurality = selection.size > 1 ? 's' : ''
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

function mapStateToProps(state) {
  const { account, tracks } = state
  const { library, playlists, playing } = tracks
  const playlist = playlists[FULL_PLAYLIST]
  const { index, selection } = playlist
  const { isPlaying } = playing
  const columns = libraryColumns.filter(c => account.columns.has(c.title))
  return {
    columns,
    library,
    selection,
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
)(TracksDeleteModal)
