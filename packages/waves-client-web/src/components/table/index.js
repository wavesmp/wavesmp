import React from 'react'

import constants from 'waves-client-constants'

import './index.css'
import Column from './column'
import PaginationButtons from './paginationButtons'
import getDragCanvas from './dragbox'

const CONTEXT_MENU_BUTTON = 2
const DOUBLE_CLICK_THRESHOLD = 500

export default class Table extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { editingPlayId: null, editingTitle: null }
    this.dragGhost = null

    this.editOnMouseUpPlayId = null
    this.editOnMouseUpTitle = null

    this.clearOnMouseUpPlayId = null
    this.clearOnMouseUpTrackId = null

    this.lastClickTime = 0
    this.lastClickPlayId = null
    this.lastClickWasForEdit = false
  }

  /* Handled by MouseDown instead */
  onContextMenu = ev => {
    ev.preventDefault()
  }

  onRowMouseDown = ev => {
    const {
      actions,
      onRowDoubleClick,
      onContextMenu,
      playlistName,
      playId,
      selection
    } = this.props

    const clickTarget = ev.target
    const clickWasForEdit = clickTarget.nodeName.toLowerCase() === 'span'
    if (clickWasForEdit && document.activeElement === clickTarget) {
      return
    }
    /* Shift for select of consecutive elements
     * Alt for toggle of individually selected items
     * No modifier for single select */
    const itemPlayId = ev.currentTarget.getAttribute(constants.PLAY_INDEX_ATTR)
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR)

    if (ev.altKey) {
      if (itemPlayId in selection) {
        actions.selectionRemove(playlistName, itemPlayId)
      } else {
        actions.selectionAdd(playlistName, itemPlayId, trackId)
      }
      this.lastClickPlayId = itemPlayId
      return
    }

    if (ev.shiftKey) {
      if (Object.keys(selection).length === 0) {
        actions.selectionAdd(playlistName, itemPlayId, trackId)
      } else {
        actions.selectionRange(
          playlistName,
          this.lastClickPlayId,
          itemPlayId,
          this.displayItems
        )
      }
      this.lastClickPlayId = itemPlayId
      return
    }

    let isSelected = itemPlayId in selection
    let isContextMenu = ev.button === CONTEXT_MENU_BUTTON
    if (!isSelected) {
      actions.selectionClearAndAdd(playlistName, itemPlayId, trackId)
    }

    if (isContextMenu) {
      /* In case we selected a new item at click time,
       * the operation is on a single item. */
      const bulk = isSelected && Object.keys(selection).length > 1
      onContextMenu(ev, itemPlayId, trackId, bulk, playlistName, playId)
      ev.preventDefault()
      return
    }
    const isSameRowClick = this.lastClickPlayId === itemPlayId
    const isSingleClick =
      new Date() - this.lastClickTime > DOUBLE_CLICK_THRESHOLD
    const isDoubleClick = isSameRowClick && !isSingleClick

    /* A single click on a selected item should clear other items.
     * However, we may be dragging, so defer clearing to mouseUp */
    if (isDoubleClick) {
      onRowDoubleClick(ev)
    } else {
      if (isSelected) {
        this.clearOnMouseUpPlayId = itemPlayId
        this.clearOnMouseUpTrackId = trackId
      }
      if (isSameRowClick && this.lastClickWasForEdit && clickWasForEdit) {
        this.editOnMouseUpPlayId = itemPlayId
        this.editOnMouseUpTitle = clickTarget.getAttribute(constants.TITLE_ATTR)
      }
    }
    this.lastClickWasForEdit = clickWasForEdit
    this.lastClickTime = new Date()
    this.lastClickPlayId = itemPlayId
  }

  /* After mousedown, either mouseup or dragstart is called (not both) */

  onRowMouseUp = ev => {
    const { actions, playlistName, transitions } = this.props
    if (this.clearOnMouseUpPlayId) {
      actions.selectionClearAndAdd(
        playlistName,
        this.clearOnMouseUpPlayId,
        this.clearOnMouseUpTrackId
      )
      this.clearOnMouseUpPlayId = null
      this.clearOnMouseUpTrackId = null
    }
    if (this.editOnMouseUpPlayId) {
      if (transitions) {
        this.setState({
          editingPlayId: this.editOnMouseUpPlayId,
          editingTitle: this.editOnMouseUpTitle
        })
      }
      this.editOnMouseUpPlayId = null
      this.editOnMouseUpTitle = null
    }
  }

  onDragStart = ev => {
    this.editOnMouseUpPlayId = null
    this.editOnMouseUpTitle = null

    this.clearOnMouseUpPlayId = null
    this.clearOnMouseUpTrackId = null

    const numSelected = Object.keys(this.props.selection).length
    this.dragGhost = getDragCanvas(numSelected, this.props.theme)

    // 1/21/2019 - Must be appended to dom for chrome
    // https://stackoverflow.com/questions/43790022/
    // html5-draggable-setdragimage-doesnt-work-with-canvas-on-chrome
    this.dragGhost.style.position = 'absolute'
    this.dragGhost.style.left = '-100%'
    document.body.append(this.dragGhost)

    const { playlistName } = this.props
    ev.dataTransfer.setData(constants.PLAYLIST_TYPE, playlistName)
    ev.dataTransfer.setDragImage(this.dragGhost, 0, 0)
  }

  onDragEnd = ev => {
    this.dragGhost.remove()
    this.dragGhost = null
  }

  onBlur = () => {
    this.setState({ editingPlayId: null, editingTitle: null })
  }

  render() {
    const {
      pathname,
      qp,
      actions,
      playId,
      sortKey,
      ascending,
      columns,
      isPlaying,
      transitions,
      selection,
      numItems,
      displayItems,
      currentPage,
      lastPage,
      onItemEdit,
      draggable
    } = this.props
    this.displayItems = displayItems
    return (
      <div>
        <table className='table table-hover'>
          <thead>
            <tr>
              {columns.map(column => (
                <Column
                  key={column.title}
                  column={column}
                  sortKey={sortKey}
                  ascending={ascending}
                  pathname={pathname}
                  qp={qp}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {this.displayItems.map((sample, index) => {
              let className = ''
              if (sample.playId in selection) {
                className = 'common-table-row-selected'
              }
              return (
                <tr
                  key={index + sample.id}
                  onMouseDown={this.onRowMouseDown}
                  onMouseUp={this.onRowMouseUp}
                  onContextMenu={this.onContextMenu}
                  data-trackid={sample.id}
                  data-playindex={sample.playId}
                  draggable={draggable}
                  onDragStart={this.onDragStart}
                  onDragEnd={this.onDragEnd}
                  className={className}
                >
                  {columns.map(column => (
                    <column.Component
                      key={column.title}
                      title={column.title}
                      isPlaying={isPlaying}
                      onChange={onItemEdit}
                      onBlur={this.onBlur}
                      playId={playId}
                      sample={sample}
                      editable={
                        transitions &&
                        this.state.editingPlayId === sample.playId &&
                        this.state.editingTitle === column.title
                      }
                    />
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        <PaginationButtons
          currentPage={currentPage}
          lastPage={lastPage}
          pathname={pathname}
          qp={qp}
          actions={actions}
        />
      </div>
    )
  }
}
