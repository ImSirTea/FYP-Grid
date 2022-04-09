import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { AnyWithGridIndex, GridState } from "@/components/grid/GridState";

export const useColumnDragManager = (
  gridState: GridState,
  gridConfiguration: GridConfiguration<AnyWithGridIndex>,
  direction: "vertical" | "horizontal"
) => {
  let draggedColumn: AnyGridColumn | null = null;
  let targetColumn: AnyGridColumn | null = null;
  let lastDragPos = 0;

  function dragStart(event: DragEvent | TouchEvent, column: AnyGridColumn) {
    draggedColumn = column;
    lastDragPos = getDragPos(event);
    gridState.columnDragged = column;
  }

  function drag(event: DragEvent | TouchEvent) {
    const eventPosition = isTouchEvent(event) ? event.touches[0] : event;

    const elementTouchIsOver = document.elementFromPoint(
      eventPosition.clientX,
      eventPosition.clientY
    );

    const elementColumnId =
      elementTouchIsOver?.attributes.getNamedItem("col-key")?.value;

    if (!elementColumnId) {
      return;
    }

    // Don't swap with our last column
    if (
      targetColumn?.key === elementColumnId &&
      !isDraggingAwayFromDraggedColumn(event)
    ) {
      lastDragPos = getDragPos(event);
      return;
    }

    targetColumn = gridConfiguration.columns.find(
      (column) => column.key === elementColumnId
    )!;

    if (targetColumn instanceof ActionColumn) {
      return;
    }

    // Don't try swap with ourselves
    if (targetColumn.key === draggedColumn?.key) {
      return;
    }

    if (draggedColumn && targetColumn) {
      gridState.rearrangeColumnOrders(draggedColumn!, targetColumn!);
    }

    lastDragPos = getDragPos(event);
  }

  function dragEnd() {
    draggedColumn = null;
    targetColumn = null;
    gridState.columnDragged = null;
  }

  function getDragPos(event: DragEvent | TouchEvent) {
    const eventPosition = isTouchEvent(event) ? event.touches[0] : event;

    return direction === "horizontal"
      ? eventPosition.clientX
      : eventPosition.clientY;
  }

  function isTouchEvent(event: DragEvent | TouchEvent): event is TouchEvent {
    return (event as TouchEvent).touches !== undefined;
  }

  // As we prevent swapping with the same column twice in a row
  // We need to allow going back where we just where
  function isDraggingAwayFromDraggedColumn(event: DragEvent | TouchEvent) {
    if (!draggedColumn || !targetColumn) {
      return true;
    }

    const draggedColumnOrder = gridState.columnStates[draggedColumn.key].order;
    const targetColumnOrder = gridState.columnStates[targetColumn.key].order;

    // Dragging right
    if (getDragPos(event) > lastDragPos) {
      return targetColumnOrder > draggedColumnOrder;
    }

    // Dragging left
    if (lastDragPos > getDragPos(event)) {
      return draggedColumnOrder > targetColumnOrder;
    }

    // Not moved
    if (lastDragPos === getDragPos(event)) {
      return false;
    }

    return true;
  }

  return {
    dragStart,
    drag,
    dragEnd,
  };
};
