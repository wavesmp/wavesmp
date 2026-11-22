import { memo, useCallback, useRef, useState } from "react";

import * as constants from "src/constants";
import { filterSelection } from "src/utils";

import "./index.css";

import { Column } from "./column";
import { getDragCanvas } from "./dragbox";
import { PaginationButtons } from "./paginationButtons";

const CONTEXT_MENU_BUTTON = 2;
const DOUBLE_CLICK_THRESHOLD = 500;
const LONG_PRESS_THRESHOLD = 600;

/* Bookkeeping for mouse, touch and drag gestures. Read and written only in
 * event handlers, so it does not need to trigger renders */
function initialGesture() {
  return {
    dragGhost: null,

    editOnMouseUpIndex: null,
    editOnMouseUpTitle: null,

    clearOnMouseUpIndex: null,
    clearOnMouseUpTrackId: null,

    clearOnTouchEndIndex: null,
    clearOnTouchEndTrackId: null,

    longPressTimeout: null,

    lastClickTime: 0,
    lastClickIndex: null,
    lastClickWasForEdit: false,
  };
}

function getOrderIndexes(ev) {
  const { currentTarget: ct } = ev;
  const { top, height } = ct.getBoundingClientRect();
  const midY = top + height / 2;
  if (ev.clientY <= midY) {
    const bottomIndex = parseInt(ct.getAttribute(constants.INDEX_ATTR), 10);
    const topIndex =
      ct.previousSibling &&
      parseInt(ct.previousSibling.getAttribute(constants.INDEX_ATTR), 10);
    return { topIndex, bottomIndex };
  }

  const topIndex = parseInt(ct.getAttribute(constants.INDEX_ATTR), 10);
  const bottomIndex =
    ct.nextSibling &&
    parseInt(ct.nextSibling.getAttribute(constants.INDEX_ATTR), 10);
  return { topIndex, bottomIndex };
}

/* Handled by MouseDown instead */
function onContextMenu(ev) {
  ev.preventDefault();
}

const Table = memo(function Table({
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
  orderable,
  playlistName,
  menubar,
  theme,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [reorderTopIndex, setReorderTopIndex] = useState(null);
  const [reorderBottomIndex, setReorderBottomIndex] = useState(null);
  const gestureRef = useRef(null);
  if (gestureRef.current === null) {
    gestureRef.current = initialGesture();
  }

  function getFilteredSelection() {
    return filterSelection(displayItems, selection);
  }

  function onShowMenuOptions() {
    const gesture = gestureRef.current;
    actions.selectionClearAndAdd(
      playlistName,
      gesture.clearOnTouchEndIndex,
      gesture.clearOnTouchEndTrackId,
      displayItems,
    );
    actions.menubarSet(true);
  }

  function onTouchStart(ev) {
    const gesture = gestureRef.current;
    gesture.longPressTimeout = setTimeout(
      onShowMenuOptions,
      LONG_PRESS_THRESHOLD,
    );
    const itemIndexAttr = ev.currentTarget.getAttribute(constants.INDEX_ATTR);
    gesture.clearOnTouchEndIndex = parseInt(itemIndexAttr, 10);
    gesture.clearOnTouchEndTrackId = ev.currentTarget.getAttribute(
      constants.TRACK_ID_ATTR,
    );
  }

  function clearLongPress() {
    clearTimeout(gestureRef.current.longPressTimeout);
  }

  function onRowDoubleClick(ev) {
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR);
    const indexAttr = ev.currentTarget.getAttribute(constants.INDEX_ATTR);
    actions.trackToggle(trackId, playlistName, parseInt(indexAttr, 10));
  }

  function onRowMouseDown(ev) {
    const gesture = gestureRef.current;
    const clickTarget = ev.target;
    const clickWasForEdit = clickTarget.nodeName.toLowerCase() === "span";
    if (clickWasForEdit && document.activeElement === clickTarget) {
      return;
    }
    /* Shift for select of consecutive elements
     * Alt for toggle of individually selected items
     * No modifier for single select */
    const itemIndexAttr = ev.currentTarget.getAttribute(constants.INDEX_ATTR);
    const itemIndex = parseInt(itemIndexAttr, 10);
    const trackId = ev.currentTarget.getAttribute(constants.TRACK_ID_ATTR);

    if (ev.altKey || menubar) {
      if (selection.has(itemIndex)) {
        actions.selectionRemove(playlistName, itemIndex);
      } else {
        actions.selectionAdd(playlistName, itemIndex, trackId);
      }
      gesture.lastClickIndex = itemIndex;
      return;
    }

    if (ev.shiftKey) {
      if (getFilteredSelection().has(gesture.lastClickIndex)) {
        actions.selectionRange(
          playlistName,
          gesture.lastClickIndex,
          itemIndex,
          displayItems,
        );
      } else {
        actions.selectionAdd(playlistName, itemIndex, trackId);
      }
      gesture.lastClickIndex = itemIndex;
      return;
    }

    const isSelected = selection.has(itemIndex);
    const isContextMenu = ev.button === CONTEXT_MENU_BUTTON;
    if (!isSelected) {
      actions.selectionClearAndAdd(
        playlistName,
        itemIndex,
        trackId,
        displayItems,
      );
    }

    if (isContextMenu) {
      /* In case we selected a new item at click time,
       * the operation is on a single item. */
      const bulk = isSelected && getFilteredSelection().size > 1;
      actions.menuSet({
        ev,
        type: constants.menuTypes.TRACK,
        props: { itemIndex, trackId, bulk, playlistName, index },
      });
      ev.preventDefault();
      return;
    }
    const isSameRowClick = gesture.lastClickIndex === itemIndex;
    const isSingleClick =
      new Date() - gesture.lastClickTime > DOUBLE_CLICK_THRESHOLD;
    const isDoubleClick = isSameRowClick && !isSingleClick;

    /* A single click on a selected item should clear other items.
     * However, we may be dragging, so defer clearing to mouseUp */
    if (isDoubleClick) {
      onRowDoubleClick(ev);
    } else {
      if (isSelected) {
        gesture.clearOnMouseUpIndex = itemIndex;
        gesture.clearOnMouseUpTrackId = trackId;
      }
      if (isSameRowClick && gesture.lastClickWasForEdit && clickWasForEdit) {
        gesture.editOnMouseUpIndex = itemIndex;
        gesture.editOnMouseUpTitle = clickTarget.getAttribute(
          constants.TITLE_ATTR,
        );
      }
    }
    gesture.lastClickWasForEdit = clickWasForEdit;
    gesture.lastClickTime = new Date();
    gesture.lastClickIndex = itemIndex;
  }

  /* After mousedown, either mouseup or dragstart is called (not both) */

  function onRowMouseUp() {
    const gesture = gestureRef.current;
    if (gesture.clearOnMouseUpIndex != null) {
      actions.selectionClearAndAdd(
        playlistName,
        gesture.clearOnMouseUpIndex,
        gesture.clearOnMouseUpTrackId,
        displayItems,
      );
      gesture.clearOnMouseUpIndex = null;
      gesture.clearOnMouseUpTrackId = null;
    }
    if (gesture.editOnMouseUpIndex != null) {
      /* Disable inline editing for small layouts */
      if (layout > 1) {
        setEditingIndex(gesture.editOnMouseUpIndex);
        setEditingTitle(gesture.editOnMouseUpTitle);
      }
      gesture.editOnMouseUpIndex = null;
      gesture.editOnMouseUpTitle = null;
    }
  }

  function onRowDragOver(ev) {
    if (
      !orderable ||
      !gestureRef.current.dragGhost ||
      !ev.dataTransfer.types.includes(constants.PLAYLIST_TYPE)
    ) {
      return;
    }
    ev.preventDefault();
    const { topIndex, bottomIndex } = getOrderIndexes(ev);
    if (topIndex !== reorderTopIndex || bottomIndex !== reorderBottomIndex) {
      setReorderTopIndex(topIndex);
      setReorderBottomIndex(bottomIndex);
    }
  }

  function onRowDragLeave() {
    if (reorderTopIndex != null || reorderBottomIndex != null) {
      setReorderTopIndex(null);
      setReorderBottomIndex(null);
    }
  }

  /* Insert items between top and bottom index.
   *
   * There may be many ways to do this since there may be elements
   * in between (e.g. when items are filtered), so put items
   * immediately after topIndex.
   *
   * If no top index is available, insert immediately before bottom
   * index. */
  async function onRowDrop() {
    const insertAt =
      reorderTopIndex != null ? reorderTopIndex + 1 : reorderBottomIndex;
    setReorderTopIndex(null);
    setReorderBottomIndex(null);
    try {
      await actions.playlistReorder(playlistName, insertAt);
    } catch (err) {
      actions.toastErr(`${err}`);
    }
  }

  function onDragStart(ev) {
    const gesture = gestureRef.current;
    gesture.editOnMouseUpIndex = null;
    gesture.editOnMouseUpTitle = null;

    gesture.clearOnMouseUpIndex = null;
    gesture.clearOnMouseUpTrackId = null;

    const numSelected = getFilteredSelection().size;
    const dragGhost = getDragCanvas(numSelected, theme);
    gesture.dragGhost = dragGhost;

    // 1/21/2019 - Must be appended to dom for chrome
    // https://stackoverflow.com/questions/43790022/
    // html5-draggable-setdragimage-doesnt-work-with-canvas-on-chrome
    dragGhost.style.position = "absolute";
    dragGhost.style.left = "-100%";
    document.body.append(dragGhost);

    ev.dataTransfer.setData(constants.PLAYLIST_TYPE, playlistName);
    ev.dataTransfer.setDragImage(dragGhost, 0, 0);
  }

  function onDragEnd() {
    const gesture = gestureRef.current;
    gesture.dragGhost.remove();
    gesture.dragGhost = null;
  }

  /* Stable, since it is passed down to every table cell */
  const onBlur = useCallback(() => {
    setEditingIndex(null);
    setEditingTitle(null);
  }, []);

  return (
    <div>
      <table className="table table-hover">
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
            let className = "";
            if (selection.has(sample.index)) {
              className = "common-table-row-selected ";
            }
            if (sample.index === reorderTopIndex) {
              className += "common-table-row-reorder-bottom";
            } else if (sample.index === reorderBottomIndex) {
              className += "common-table-row-reorder-top";
            }
            return (
              <tr
                key={sample.index + sample.id}
                onMouseDown={onRowMouseDown}
                onDragOver={onRowDragOver}
                onDragLeave={onRowDragLeave}
                onDrop={onRowDrop}
                onMouseUp={onRowMouseUp}
                onContextMenu={onContextMenu}
                data-trackid={sample.id}
                data-index={sample.index}
                draggable={draggable}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onTouchStart={onTouchStart}
                onTouchEnd={clearLongPress}
                onTouchMove={clearLongPress}
                onTouchCancel={clearLongPress}
                className={className}
              >
                {columns.map((column) => (
                  <column.Component
                    key={column.title}
                    title={column.title}
                    isPlaying={isPlaying}
                    onChange={onItemEdit}
                    onBlur={onBlur}
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
            );
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
  );
});

export { Table };
