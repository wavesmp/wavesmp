import React from 'react'

import constants from 'waves-client-constants'
import { filterSelection } from 'waves-client-util'

import './index.css'
import Column from './column'
import PaginationButtons from './paginationButtons'
import getDragCanvas from './dragbox'

const CONTEXT_MENU_BUTTON = 2
const DOUBLE_CLICK_THRESHOLD = 500
const LONG_PRESS_THRESHOLD = 600

export default class Table extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      editingIndex: null,
      editingTitle: null,
      reorderTopIndex: null,
      reorderBottomIndex: null,
    }
    this.dragGhost = null

    this.editOnMouseUpIndex = null
    this.editOnMouseUpTitle = null

    this.clearOnMouseUpIndex = null
    this.clearOnMouseUpTrackId = null

    this.clearOnTouchEndIndex = null
    this.clearOnTouchEndTrackId = null

    this.lastClickTime = 0
    this.lastClickIndex = null
    this.lastClickWasForEdit = false
  }

  /* Handled by MouseDown instead */
  onContextMenu = (ev) => {
    ev.preventDefault()
  }

  getFilteredSelection() {
    const { selection, displayItems } = this.props
    return filterSelection(displayItems, selection)
  }

  onShowMenuOptions = () => {
    const { actions, playlistName, displayItems } = this.props
    actions.selectionClearAndAdd(
      playlistName,
      this.clearOnTouchEndIndex,
      this.clearOnTouchEndTrackId,
      displayItems,
    )
    actions.menubarSet(true)
  }

  onTouchStart = (ev) => {
    this.longPressTimeout = setTimeout(
      this.onShowMenuOptions,
      LONG_PRESS_THRESHOLD,
    )
    const itemIndexAttr = ev.currentTarget.getAttribute(constants.INDEX_ATTR)
    const itemIndex = parseInt(itemIndexAttr, 10)
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR)
    this.clearOnTouchEndIndex = itemIndex
    this.clearOnTouchEndTrackId = trackId
  }

  onTouchEnd = () => {
    clearTimeout(this.longPressTimeout)
  }

  onTouchCancel = () => {
    clearTimeout(this.longPressTimeout)
  }

  onTouchMove = () => {
    clearTimeout(this.longPressTimeout)
  }

  onRowDoubleClick(ev) {
    const { actions, playlistName } = this.props
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR)
    const indexAttr = ev.currentTarget.getAttribute(constants.INDEX_ATTR)
    const index = parseInt(indexAttr, 10)
    actions.trackToggle(trackId, playlistName, index)
  }

  onRowMouseDown = (ev) => {
    const { actions, playlistName, index, selection, menubar, displayItems } =
      this.props

    const clickTarget = ev.target
    const clickWasForEdit = clickTarget.nodeName.toLowerCase() === 'span'
    if (clickWasForEdit && document.activeElement === clickTarget) {
      return
    }
    /* Shift for select of consecutive elements
     * Alt for toggle of individually selected items
     * No modifier for single select */
    const itemIndexAttr = ev.currentTarget.getAttribute(constants.INDEX_ATTR)
    const itemIndex = parseInt(itemIndexAttr, 10)
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR)

    if (ev.altKey || menubar) {
      if (selection.has(itemIndex)) {
        actions.selectionRemove(playlistName, itemIndex)
      } else {
        actions.selectionAdd(playlistName, itemIndex, trackId)
      }
      this.lastClickIndex = itemIndex
      return
    }

    if (ev.shiftKey) {
      if (this.getFilteredSelection().has(this.lastClickIndex)) {
        actions.selectionRange(
          playlistName,
          this.lastClickIndex,
          itemIndex,
          displayItems,
        )
      } else {
        actions.selectionAdd(playlistName, itemIndex, trackId)
      }
      this.lastClickIndex = itemIndex
      return
    }

    const isSelected = selection.has(itemIndex)
    const isContextMenu = ev.button === CONTEXT_MENU_BUTTON
    if (!isSelected) {
      actions.selectionClearAndAdd(
        playlistName,
        itemIndex,
        trackId,
        displayItems,
      )
    }

    if (isContextMenu) {
      /* In case we selected a new item at click time,
       * the operation is on a single item. */
      const bulk = isSelected && this.getFilteredSelection().size > 1
      actions.menuSet({
        ev,
        type: constants.menuTypes.TRACK,
        props: { itemIndex, trackId, bulk, playlistName, index },
      })
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
      this.onRowDoubleClick(ev)
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

  onRowMouseUp = () => {
    const { actions, playlistName, layout, displayItems } = this.props
    if (this.clearOnMouseUpIndex != null) {
      actions.selectionClearAndAdd(
        playlistName,
        this.clearOnMouseUpIndex,
        this.clearOnMouseUpTrackId,
        displayItems,
      )
      this.clearOnMouseUpIndex = null
      this.clearOnMouseUpTrackId = null
    }
    if (this.editOnMouseUpIndex != null) {
      /* Disable inline editing for small layouts */
      if (layout > 1) {
        this.setState({
          editingIndex: this.editOnMouseUpIndex,
          editingTitle: this.editOnMouseUpTitle,
        })
      }
      this.editOnMouseUpIndex = null
      this.editOnMouseUpTitle = null
    }
  }

  getOrderIndexes(ev) {
    const { currentTarget: ct } = ev
    const { top, height } = ct.getBoundingClientRect()
    const midY = top + height / 2
    if (ev.clientY <= midY) {
      const bottomIndex = parseInt(ct.getAttribute(constants.INDEX_ATTR), 10)
      const topIndex =
        ct.previousSibling &&
        parseInt(ct.previousSibling.getAttribute(constants.INDEX_ATTR), 10)
      return { topIndex, bottomIndex }
    }

    const topIndex = parseInt(ct.getAttribute(constants.INDEX_ATTR), 10)
    const bottomIndex =
      ct.nextSibling &&
      parseInt(ct.nextSibling.getAttribute(constants.INDEX_ATTR), 10)
    return { topIndex, bottomIndex }
  }

  onRowDragOver = (ev) => {
    const { orderable } = this.props
    if (
      !orderable ||
      !this.dragGhost ||
      !ev.dataTransfer.types.includes(constants.PLAYLIST_TYPE)
    ) {
      return
    }
    ev.preventDefault()
    const { topIndex, bottomIndex } = this.getOrderIndexes(ev)
    const { reorderTopIndex, reorderBottomIndex } = this.state
    if (topIndex !== reorderTopIndex || bottomIndex !== reorderBottomIndex) {
      this.setState({
        reorderTopIndex: topIndex,
        reorderBottomIndex: bottomIndex,
      })
    }
  }

  onRowDragLeave = () => {
    const { reorderTopIndex, reorderBottomIndex } = this.state
    if (reorderTopIndex != null || reorderBottomIndex != null) {
      this.setState({ reorderTopIndex: null, reorderBottomIndex: null })
    }
  }

  getInsertAt() {
    const { reorderTopIndex, reorderBottomIndex } = this.state
    if (reorderTopIndex != null) {
      return reorderTopIndex + 1
    }
    return reorderBottomIndex
  }

  /* Insert items between top and bottom index.
   *
   * There may be many ways to do this since there may be elements
   * in between (e.g. when items are filtered), so put items
   * immediately after topIndex.
   *
   * If no top index is available, insert immediately before bottom
   * index. */
  onRowDrop = async () => {
    this.setState({ reorderTopIndex: null, reorderBottomIndex: null })
    const { actions, playlistName } = this.props
    const insertAt = this.getInsertAt()
    try {
      await actions.playlistReorder(playlistName, insertAt)
    } catch (err) {
      actions.toastErr(`${err}`)
    }
  }

  onDragStart = (ev) => {
    this.editOnMouseUpIndex = null
    this.editOnMouseUpTitle = null

    this.clearOnMouseUpIndex = null
    this.clearOnMouseUpTrackId = null

    const { theme, playlistName } = this.props
    const numSelected = this.getFilteredSelection().size
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

  onDragEnd = () => {
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
      layout,
      selection,
      displayItems,
      currentPage,
      lastPage,
      onItemEdit,
      draggable,
    } = this.props
    const { reorderTopIndex, reorderBottomIndex, editingIndex, editingTitle } =
      this.state
    return (
      <div>
        <table className='table table-hover'>
          <thead>
            <tr>
              {columns.map((column) => (
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
            {displayItems.map((sample) => {
              let className = ''
              if (selection.has(sample.index)) {
                className = 'common-table-row-selected '
              }
              if (sample.index === reorderTopIndex) {
                className += 'common-table-row-reorder-bottom'
              } else if (sample.index === reorderBottomIndex) {
                className += 'common-table-row-reorder-top'
              }
              return (
                <tr
                  key={sample.index + sample.id}
                  onMouseDown={this.onRowMouseDown}
                  onDragOver={this.onRowDragOver}
                  onDragLeave={this.onRowDragLeave}
                  onDrop={this.onRowDrop}
                  onMouseUp={this.onRowMouseUp}
                  onContextMenu={this.onContextMenu}
                  data-trackid={sample.id}
                  data-index={sample.index}
                  draggable={draggable}
                  onDragStart={this.onDragStart}
                  onDragEnd={this.onDragEnd}
                  onTouchStart={this.onTouchStart}
                  onTouchEnd={this.onTouchEnd}
                  onTouchMove={this.onTouchMove}
                  onTouchCancel={this.onTouchCancel}
                  className={className}
                >
                  {columns.map((column) => (
                    <column.Component
                      key={column.title}
                      title={column.title}
                      isPlaying={isPlaying}
                      onChange={onItemEdit}
                      onBlur={this.onBlur}
                      index={index}
                      sample={sample}
                      editable={
                        layout &&
                        editingIndex === sample.index &&
                        editingTitle === column.title
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
