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
    this.state = { editingIndex: null, editingTitle: null }
    this.dragGhost = null

    this.editOnMouseUpIndex = null
    this.editOnMouseUpTitle = null

    this.clearOnMouseUpIndex = null
    this.clearOnMouseUpTrackId = null

    this.lastClickTime = 0
    this.lastClickIndex = null
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
      index,
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
    const itemIndex = parseInt(
      ev.currentTarget.getAttribute(constants.INDEX_ATTR)
    )
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR)

    if (ev.altKey) {
      if (selection.has(itemIndex)) {
        actions.selectionRemove(playlistName, itemIndex)
      } else {
        actions.selectionAdd(playlistName, itemIndex, trackId)
      }
      this.lastClickIndex = itemIndex
      return
    }

    if (ev.shiftKey) {
      if (selection.size === 0) {
        actions.selectionAdd(playlistName, itemIndex, trackId)
      } else {
        actions.selectionRange(
          playlistName,
          this.lastClickIndex,
          itemIndex,
          this.displayItems
        )
      }
      this.lastClickIndex = itemIndex
      return
    }

    let isSelected = selection.has(itemIndex)
    let isContextMenu = ev.button === CONTEXT_MENU_BUTTON
    if (!isSelected) {
      actions.selectionClearAndAdd(playlistName, itemIndex, trackId)
    }

    if (isContextMenu) {
      /* In case we selected a new item at click time,
       * the operation is on a single item. */
      const bulk = isSelected && selection.size > 1
      onContextMenu(ev, { itemIndex, trackId, bulk, playlistName, index })
      ev.preventDefault()
      return
    }
    const isSameRowClick = this.lastClickIndex === itemIndex
    const isSingleClick =
      new Date() - this.lastClickTime > DOUBLE_CLICK_THRESHOLD
    const isDoubleClick = isSameRowClick && !isSingleClick

    /* A single click on a selected item should clear other items.
     * However, we may be dragging, so defer clearing to mouseUp */
    if (isDoubleClick) {
      onRowDoubleClick(ev)
    } else {
      if (isSelected) {
        this.clearOnMouseUpIndex = itemIndex
        this.clearOnMouseUpTrackId = trackId
      }
      if (isSameRowClick && this.lastClickWasForEdit && clickWasForEdit) {
        this.editOnMouseUpIndex = itemIndex
        this.editOnMouseUpTitle = clickTarget.getAttribute(constants.TITLE_ATTR)
      }
    }
    this.lastClickWasForEdit = clickWasForEdit
    this.lastClickTime = new Date()
    this.lastClickIndex = itemIndex
  }

  /* After mousedown, either mouseup or dragstart is called (not both) */

  onRowMouseUp = ev => {
    const { actions, playlistName, transitions } = this.props
    if (this.clearOnMouseUpIndex) {
      actions.selectionClearAndAdd(
        playlistName,
        this.clearOnMouseUpIndex,
        this.clearOnMouseUpTrackId
      )
      this.clearOnMouseUpIndex = null
      this.clearOnMouseUpTrackId = null
    }
    if (this.editOnMouseUpIndex) {
      if (transitions) {
        this.setState({
          editingIndex: this.editOnMouseUpIndex,
          editingTitle: this.editOnMouseUpTitle
        })
      }
      this.editOnMouseUpIndex = null
      this.editOnMouseUpTitle = null
    }
  }

  onDragStart = ev => {
    this.editOnMouseUpIndex = null
    this.editOnMouseUpTitle = null

    this.clearOnMouseUpIndex = null
    this.clearOnMouseUpTrackId = null

    const { theme, selection, playlistName } = this.props
    const numSelected = selection.size
    this.dragGhost = getDragCanvas(numSelected, theme)

    // 1/21/2019 - Must be appended to dom for chrome
    // https://stackoverflow.com/questions/43790022/
    // html5-draggable-setdragimage-doesnt-work-with-canvas-on-chrome
    this.dragGhost.style.position = 'absolute'
    this.dragGhost.style.left = '-100%'
    document.body.append(this.dragGhost)

    ev.dataTransfer.setData(constants.PLAYLIST_TYPE, playlistName)
    ev.dataTransfer.setDragImage(this.dragGhost, 0, 0)
  }

  onDragEnd = ev => {
    this.dragGhost.remove()
    this.dragGhost = null
  }

  onBlur = () => {
    this.setState({ editingIndex: null, editingTitle: null })
  }

  render() {
    const {
      pathname,
      qp,
      actions,
      index,
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
            {this.displayItems.map(sample => {
              let className = ''
              if (selection.has(sample.index)) {
                className = 'common-table-row-selected'
              }
              return (
                <tr
                  key={sample.index + sample.id}
                  onMouseDown={this.onRowMouseDown}
                  onMouseUp={this.onRowMouseUp}
                  onContextMenu={this.onContextMenu}
                  data-trackid={sample.id}
                  data-index={sample.index}
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
                      index={index}
                      sample={sample}
                      editable={
                        transitions &&
                        this.state.editingIndex === sample.index &&
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
