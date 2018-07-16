import React from 'react'

import constants from 'waves-client-constants'

import './index.css'
import Column from './column'
import PaginationButtons from './paginationButtons'

const CONTEXT_MENU_BUTTON = 2
const DOUBLE_CLICK_THRESHOLD = 500

export default class Table extends React.Component {

  constructor(props) {
    super(props)

    this.dragInProgress = false
    this.lastClickTime = 0
    this.lastClickPlayId = null
    this.lastClickWasForEdit = false
    this.clearOnMouseUp = null
    this.clearOnMouseUpTrackId = null
    this.editOnMouseUp = false
  }

  /* Make rows draggable */
  componentDidMount() {
    const { draggable } = this.props
    if (!draggable) {
      return
    }

    // TODO might need to call destroy method on widget
    // e.g. $( 'tr' ).draggable("destroy")
    // See https://learn.jquery.com/jquery-ui/how-jquery-ui-works/
    $( 'tr' ).draggable({
      helper: (ev) => {
        const selected = $('.common-table-row-selected')
        const container = $('<table/>')
        container.append(selected.clone())
        this.dragInProgress = true
        return container
      },
      cursorAt: {top: 5, left: 5},
      cursor: 'move',
      stack: 'table',
      /* To allow for editing of row properties, disallow drag for span.
       * Instead, drag can be used for track selection */
      cancel: "span"
    })
  }

  /* Handled by MouseDown instead */
  onContextMenu = ev => {
    ev.preventDefault()
  }

  // https://stackoverflow.com/questions/3805852/
  // select-all-text-in-contenteditable-div-when-it-focus-click
  selectContentEditable(el) {
    const range = document.createRange();
    range.selectNodeContents(el);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  onRowMouseUp = ev => {
    const { actions, playlistName } = this.props
    if (this.dragInProgress) {
      this.dragInProgress = false
      this.clearOnMouseUp = false
      this.editOnMouseUp = false
      return
    }
    if (this.clearOnMouseUp) {
      actions.selectionClearAndAdd(playlistName, this.clearOnMouseUp, this.clearOnMouseUpTrackId)
      this.clearOnMouseUp = false
      this.clearOnMouseUpTrackId = false
    }
    if (this.editOnMouseUp) {
      const el = ev.target
      el.focus()
      this.selectContentEditable(el)
      this.editOnMouseUp = false
    }
  }

  onRowMouseDown = ev => {
    const { actions, onRowDoubleClick, onContextMenu,
            playlistName, playId, selection } = this.props

    const clickTarget = ev.target
    const clickWasForEdit = clickTarget.nodeName.toLowerCase() === 'span'
    if (clickWasForEdit && document.activeElement === clickTarget) {
      return
    }
    // TODO For some reason, span contenteditable is not blurred here,
    // but it is being blurred when clicking outside of the table.
    // Do it manually
    if (document.activeElement) {
      document.activeElement.blur()
      getSelection().removeAllRanges()
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
        actions.selectionRange(playlistName, this.lastClickPlayId, itemPlayId, this.displayItems)
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
      const bulk = isSelected && (Object.keys(selection).length > 1)
      onContextMenu(ev, itemPlayId, trackId, bulk, playlistName, playId)
      ev.preventDefault()
      return
    }
    const isSameRowClick = this.lastClickPlayId === itemPlayId
    const isSingleClick = new Date() - this.lastClickTime > DOUBLE_CLICK_THRESHOLD
    const isDoubleClick = isSameRowClick && !isSingleClick

    /* A single click on a selected item should clear other items.
     * However, we may be dragging, so defer clearing to mouseUp */
    if (isDoubleClick) {
      onRowDoubleClick(ev)
    } else {
      if (isSelected) {
        this.clearOnMouseUp = itemPlayId
        this.clearOnMouseUpTrackId = trackId
      }
      if (isSameRowClick && this.lastClickWasForEdit && clickWasForEdit) {
        this.editOnMouseUp = true
      }
    }
    this.lastClickWasForEdit = clickWasForEdit
    this.lastClickTime = new Date()
    this.lastClickPlayId = itemPlayId
  }

  render() {
    const { location, actions, playId,
            sortKey, ascending, columns,
            isPlaying, rowsPerPage, transitions,
            selection, numItems, getDisplayItems,
            onItemEdit } = this.props

    /* Pagination */
    const qp = new URLSearchParams(location.search)
    let currentPage = Math.floor(parseInt(qp.get('page'), 10) || 0)
    let lastPage = Math.floor((numItems - 1) / rowsPerPage)
    if (currentPage < 0) {
      currentPage = 0
    } else if (currentPage > lastPage) {
      currentPage = lastPage
    }
    const startIndex = currentPage * rowsPerPage
    const stopIndex = (currentPage + 1) * rowsPerPage
    this.displayItems = getDisplayItems(startIndex, stopIndex)

    // TODO figure out how to use constants as attribute name
    // TODO find a way to forward all attrs to column.Component
    // If row in selected rows
    return (
      <div>
        <table className='table table-hover'>
          <thead>
            <tr>
              {columns.map(column => (
                <Column key={column.title} column={column} sortKey={sortKey}
                        ascending={ascending} location={location}/>
              ))}
            </tr>
          </thead>
          <tbody>
          {this.displayItems.map((sample, index) => {
            let className = ''
            if (sample.playId in selection) {
              className = 'common-table-row-selected'
            }
            return <tr key={index + sample.id}
                       onMouseDown={this.onRowMouseDown}
                       onMouseUp={this.onRowMouseUp}
                       onContextMenu={this.onContextMenu}
                       data-trackid={sample.id}
                       data-playindex={sample.playId}
                       className={className}>
               {columns.map(column => (
                 <column.Component
                   key={column.title}
                   isPlaying={isPlaying}
                   onChange={onItemEdit}
                   playId={playId}
                   sample={sample}
                   editable={transitions}/>
                ))}
             </tr>
           })}
          </tbody>
        </table>
        <PaginationButtons currentPage={currentPage}
                           lastPage={lastPage}
                           location={location}
                           actions={actions}/>
      </div>
    )
  }
}
