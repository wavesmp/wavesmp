import type { DragEvent, JSX, MouseEvent, TouchEvent } from "react";
import { memo, useCallback, useRef, useState } from "react";

import * as constants from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";
import type { Selection } from "src/types/playlistTypes";
import type { Layout } from "src/types/stateTypes";
import type { NormalizedTrack } from "src/types/trackTypes";
import { filterSelection } from "src/utils";

import "./index.css";

import { Column } from "./column";
import { getDragCanvas } from "./dragbox";
import { PaginationButtons } from "./paginationButtons";
import type { Column as ColumnDef, OnItemEdit } from "./tableTypes";

const CONTEXT_MENU_BUTTON = 2;
const DOUBLE_CLICK_THRESHOLD = 500;
const LONG_PRESS_THRESHOLD = 600;

/* Bookkeeping for mouse, touch and drag gestures. Read and written only in
 * event handlers, so it does not need to trigger renders */
interface Gesture {
  dragGhost: HTMLCanvasElement | null;

  editOnMouseUpIndex: number | null;
  editOnMouseUpTitle: string | null;

  clearOnMouseUpIndex: number | null;
  clearOnMouseUpTrackId: string | null;

  clearOnTouchEndIndex: number | null;
  clearOnTouchEndTrackId: string | null;

  longPressTimeout: ReturnType<typeof setTimeout> | undefined;

  lastClickTime: number;
  lastClickIndex: number | null;
  lastClickWasForEdit: boolean;
}

function initialGesture(): Gesture {
  return {
    dragGhost: null,

    editOnMouseUpIndex: null,
    editOnMouseUpTitle: null,

    clearOnMouseUpIndex: null,
    clearOnMouseUpTrackId: null,

    clearOnTouchEndIndex: null,
    clearOnTouchEndTrackId: null,

    longPressTimeout: undefined,

    lastClickTime: 0,
    lastClickIndex: null,
    lastClickWasForEdit: false,
  };
}

/* The index of a row element, or null for no row */
function getRowIndex(row: Element | null): number | null {
  if (!row) {
    return null;
  }
  return parseInt(row.getAttribute(constants.INDEX_ATTR) ?? "", 10);
}

/* The item index and track id of a row */
function getRowItem(row: HTMLElement): { itemIndex: number; trackId: string } {
  const itemIndex = getRowIndex(row) ?? NaN;
  const trackId = row.getAttribute(constants.TRACK_ID_ATTR) ?? "";
  return { itemIndex, trackId };
}

interface OrderIndexes {
  topIndex: number | null;
  bottomIndex: number | null;
}

function getOrderIndexes(ev: DragEvent<HTMLElement>): OrderIndexes {
  const { currentTarget: ct } = ev;
  const { top, height } = ct.getBoundingClientRect();
  const midY = top + height / 2;
  if (ev.clientY <= midY) {
    const bottomIndex = getRowIndex(ct);
    const topIndex = getRowIndex(ct.previousElementSibling);
    return { topIndex, bottomIndex };
  }

  const topIndex = getRowIndex(ct);
  const bottomIndex = getRowIndex(ct.nextElementSibling);
  return { topIndex, bottomIndex };
}

/* Handled by MouseDown instead */
function onContextMenu(ev: MouseEvent): void {
  ev.preventDefault();
}

interface TableProps {
  pathname: string;
  qp: URLSearchParams;
  actions: BoundActions;
  /* Index of the playing track */
  index: number | null;
  sortKey: string | undefined;
  ascending: boolean | undefined;
  columns: ColumnDef[];
  isPlaying: boolean;
  layout: Layout;
  selection: Selection;
  displayItems: NormalizedTrack[];
  currentPage: number;
  lastPage: number;
  onItemEdit: OnItemEdit;
  draggable: boolean;
  orderable: boolean;
  playlistName: string;
  menubar: boolean;
  theme: string;
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
}: TableProps): JSX.Element {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [reorderTopIndex, setReorderTopIndex] = useState<number | null>(null);
  const [reorderBottomIndex, setReorderBottomIndex] = useState<number | null>(
    null,
  );
  const gestureRef = useRef<Gesture>(null);
  /* Created on first use */
  const getGesture = (): Gesture => {
    gestureRef.current ??= initialGesture();
    return gestureRef.current;
  };

  function getFilteredSelection(): Selection {
    return filterSelection(displayItems, selection);
  }

  function onShowMenuOptions(): void {
    const gesture = getGesture();
    const { clearOnTouchEndIndex, clearOnTouchEndTrackId } = gesture;
    if (clearOnTouchEndIndex === null || clearOnTouchEndTrackId === null) {
      return;
    }
    actions.selectionClearAndAdd(
      playlistName,
      clearOnTouchEndIndex,
      clearOnTouchEndTrackId,
      displayItems,
    );
    actions.menubarSet(true);
  }

  function onTouchStart(ev: TouchEvent<HTMLElement>): void {
    const gesture = getGesture();
    gesture.longPressTimeout = setTimeout(
      onShowMenuOptions,
      LONG_PRESS_THRESHOLD,
    );
    const { itemIndex, trackId } = getRowItem(ev.currentTarget);
    gesture.clearOnTouchEndIndex = itemIndex;
    gesture.clearOnTouchEndTrackId = trackId;
  }

  function clearLongPress(): void {
    clearTimeout(getGesture().longPressTimeout);
  }

  function onRowDoubleClick(ev: MouseEvent<HTMLElement>): void {
    const { itemIndex, trackId } = getRowItem(ev.currentTarget);
    actions.trackToggle(trackId, playlistName, itemIndex);
  }

  function onRowMouseDown(ev: MouseEvent<HTMLElement>): void {
    const gesture = getGesture();
    const clickTarget = ev.target as Element;
    const clickWasForEdit = clickTarget.nodeName.toLowerCase() === "span";
    if (clickWasForEdit && document.activeElement === clickTarget) {
      return;
    }
    /* Shift for select of consecutive elements
     * Alt for toggle of individually selected items
     * No modifier for single select */
    const { itemIndex, trackId } = getRowItem(ev.currentTarget);

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
      const { lastClickIndex } = gesture;
      if (
        lastClickIndex !== null &&
        getFilteredSelection().has(lastClickIndex)
      ) {
        actions.selectionRange(
          playlistName,
          lastClickIndex,
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
      Date.now() - gesture.lastClickTime > DOUBLE_CLICK_THRESHOLD;
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
    gesture.lastClickTime = Date.now();
    gesture.lastClickIndex = itemIndex;
  }

  /* After mousedown, either mouseup or dragstart is called (not both) */

  function onRowMouseUp(): void {
    const gesture = getGesture();
    const { clearOnMouseUpIndex, clearOnMouseUpTrackId } = gesture;
    if (clearOnMouseUpIndex != null && clearOnMouseUpTrackId != null) {
      actions.selectionClearAndAdd(
        playlistName,
        clearOnMouseUpIndex,
        clearOnMouseUpTrackId,
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

  function onRowDragOver(ev: DragEvent<HTMLElement>): void {
    if (
      !orderable ||
      !getGesture().dragGhost ||
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

  function onRowDragLeave(): void {
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
  async function onRowDrop(): Promise<void> {
    const insertAt =
      reorderTopIndex != null ? reorderTopIndex + 1 : reorderBottomIndex;
    setReorderTopIndex(null);
    setReorderBottomIndex(null);
    /* Rows set the indexes on drag over, before the drop */
    if (insertAt === null) {
      return;
    }
    try {
      await actions.playlistReorder(playlistName, insertAt);
    } catch (err) {
      actions.toastErr(String(err));
    }
  }

  function onDragStart(ev: DragEvent<HTMLElement>): void {
    const gesture = getGesture();
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

  function onDragEnd(): void {
    const gesture = getGesture();
    gesture.dragGhost?.remove();
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
                key={sample.index.toString() + sample.id}
                onMouseDown={onRowMouseDown}
                onDragOver={onRowDragOver}
                onDragLeave={onRowDragLeave}
                onDrop={() => void onRowDrop()}
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
                      layout > 0 &&
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
      />
    </div>
  );
});

export { Table };
export type { TableProps };
