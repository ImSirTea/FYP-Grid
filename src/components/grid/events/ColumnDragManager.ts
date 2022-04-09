import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridState } from "@/components/grid/GridState";

export const useColumnDragManager = (
  gridState: GridState,
  direction: "vertical" | "horizontal"
) => {
  let draggedColumn: AnyGridColumn | null = null;
  let targetColumn: AnyGridColumn | null = null;
  let lastDragPos = 0;

  function getDragPos(event: DragEvent) {
    return direction === "horizontal" ? event.clientX : event.clientY;
  }

  function dragStart(event: DragEvent, column: AnyGridColumn) {
    draggedColumn = column;
    lastDragPos = getDragPos(event);
  }

  function dragOver(event: DragEvent, column: AnyGridColumn) {
    if (column instanceof ActionColumn) {
      return;
    }

    event.preventDefault();

    // Don't swap with our last column
    if (
      targetColumn?.key === column.key &&
      !isDraggingAwayFromDraggedColumn(event)
    ) {
      lastDragPos = getDragPos(event);
      return;
    }

    targetColumn = column;

    // Don't try swap with ourselves
    if (targetColumn.key === draggedColumn?.key) {
      return;
    }

    if (draggedColumn && targetColumn) {
      gridState.rearrangeColumnOrders(draggedColumn, targetColumn);
    }

    lastDragPos = getDragPos(event);
  }

  function dragEnd() {
    draggedColumn = null;
    targetColumn = null;
  }

  // As we prevent swapping with the same column twice in a row
  // We need to allow going back where we just where
  function isDraggingAwayFromDraggedColumn(event: DragEvent) {
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
    dragOver,
    dragEnd,
  };
};
