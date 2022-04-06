<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridManager } from "@/components/grid/GridManager";
import { GridState } from "@/components/grid/GridState";
import { defineComponent, inject, h, computed } from "@vue/composition-api";
import { VNode } from "vue";
import { VIcon } from "vuetify/lib/components";
import { debounce } from "lodash";

export default defineComponent({
  name: "GridHeader",
  props: {
    rowHeight: {
      type: Number,
      required: false,
      default: 36,
    },
    gridOffsetLeft: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const gridConfiguration =
      inject<GridConfiguration<Record<string, any>>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;

    // Drag handlers
    let draggedColumn: AnyGridColumn | null = null;
    let targetColumn: AnyGridColumn | null = null;
    let isResizing = false;
    let lastResizeX = 0;
    let lastDragX = 0;

    // How wide should our header row should be to align with the grid
    const totalGridWidth = computed(() =>
      gridConfiguration.columns.reduce(
        (totalWidth, column) =>
          totalWidth + gridState.columnStates[column.key].width,
        0
      )
    );

    // Generate our header rows
    const headers = computed(() => [buildHeaderRow()]);

    // ONLY USE IN CONTEXT OF RENDERING
    const buildHeaderRow = () => {
      const { left, none, right } = gridManager.pinnedSortedAndVisibleColumns;

      const cells = {
        left: left.map((column) => buildCell(column)),
        none: none.map((column) => buildCell(column)),
        right: right.map((column) => buildCell(column)),
      };

      return h(
        "div",
        {
          class: "grid-header",
          style: {
            width: totalGridWidth.value + "px",
            height: props.rowHeight + "px",
            transform: `translateX(${-props.gridOffsetLeft + "px"}`,
          },
        },
        [cells.left, cells.none, cells.right]
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn) => {
      const sortIcon = column.options.isSortable
        ? buildSortIcon(column)
        : undefined;

      const resizeBar = buildResizeBar(column);

      return h(
        "div",
        {
          style: {
            width: gridState.columnStates[column.key].width + "px",
            height: props.rowHeight + "px",
          },
          class: "grid-header-cell",
          on: {
            // Toggle our sorting behaviours
            click: () => {
              gridState.toggleSort(column);
            },
            // Set our drag type and data
            dragstart: (event: DragEvent) => {
              //event.dataTransfer!.dropEffect = "move";
              draggedColumn = column;
              lastDragX = event.clientX;
            },
            // Allow the header to be the drop target, and reassign when needed
            dragover: (event: DragEvent) => {
              event.preventDefault();

              // Don't allow moving when we are resizing
              if (isResizing) {
                return;
              }

              // Don't swap with our last column
              if (
                targetColumn?.key === column.key &&
                !isDraggingAwayFromDraggedColumn(event)
              ) {
                lastDragX = event.clientX;
                return;
              }

              targetColumn = column;

              // Don't try swap with ourselves
              if (targetColumn.key === draggedColumn?.key) {
                return;
              }

              if (draggedColumn && targetColumn) {
                gridState.rearrangeColumnOrders(draggedColumn!, targetColumn!);
              }

              lastDragX = event.clientX;
            },
            drop: (event: DragEvent) => {
              draggedColumn = null;
              targetColumn = null;
            },
          },
          domProps: {
            draggable: column.options.isDraggable,
          },
        },
        [column.key, sortIcon, resizeBar]
      );
    };

    // As we prevent swapping with the same column twice in a row
    // We need to allow going back where we just where
    const isDraggingAwayFromDraggedColumn = (event: DragEvent) => {
      if (!draggedColumn || !targetColumn) {
        return true;
      }

      const draggedColumnOrder =
        gridState.columnStates[draggedColumn.key].order;
      const targetColumnOrder = gridState.columnStates[targetColumn.key].order;

      // Dragging right
      if (event.clientX > lastDragX) {
        return targetColumnOrder > draggedColumnOrder;
      }

      // Dragging left
      if (lastDragX > event.clientX) {
        return draggedColumnOrder > targetColumnOrder;
      }

      // Not moved
      if (lastDragX === event.clientX) {
        return false;
      }

      return true;
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildSortIcon = (column: AnyGridColumn) => {
      const isSortingOn = gridState.isSortingOnKey(column);
      const sortingIcon =
        isSortingOn?.direction === "desc"
          ? column.options.descIcon
          : column.options.ascIcon;

      return [
        h(
          VIcon,
          {
            class: {
              "grid-sort-icon": true,
              "grid-sort-active": !!isSortingOn,
            },
            props: { small: true },
          },
          sortingIcon
        ),
        h(
          "sup",
          { class: "grid-sorting-index" },
          isSortingOn?.index.toString() ?? ""
        ),
      ];
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildResizeBar = (column: AnyGridColumn) => {
      return h("div", {
        class: "grid-header-resize",
        domProps: { draggable: true },
        on: {
          // Prevent sorting click
          click: (event: PointerEvent) => {
            event.stopPropagation();
            event.preventDefault();
          },
          // Get our widest visible cell, and resize our column to fit
          dblclick: () => {
            const relevantCells = Array.from(
              document.querySelectorAll(`[col-key=${column.key}]`)
            );
            const largestWidth = Math.max(
              ...relevantCells.map((cell) => cell.clientWidth)
            );
            gridState.columnStates[column.key].width = largestWidth;
          },
          // Initiate our drag
          dragstart: (event: DragEvent) => {
            isResizing = true;
            lastResizeX = event.clientX;
          },
          drag: debounce((event: DragEvent) => {
            // Don't resize if we shouldn't be, or if this is the last drag event
            if (!isResizing || !event.clientX) {
              return;
            }

            const resizeDelta = event.clientX - lastResizeX;
            gridState.columnStates[column.key].width += resizeDelta;
            lastResizeX = event.clientX;
          }),
          drop: () => {
            isResizing = false;
          },
        },
      });
    };

    return {
      headers,
      totalGridWidth,
      gridState,
      gridManager,
    };
  },
  render(): VNode {
    // Returns them has a group, inside their container
    return h(
      "div",
      {
        class: "grid-header-container",
      },
      this.headers
    );
  },
});
</script>
