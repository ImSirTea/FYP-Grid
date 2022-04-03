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
    let lastClientX = 0;

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
      const cells = gridManager.visibleColumns.map((column) =>
        buildCell(column)
      );
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
        cells
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn) => {
      const sortIcon = column.options.isSortable
        ? buildSortIcon(column)
        : undefined;

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
              event.dataTransfer!.dropEffect = "move";
              draggedColumn = column;
              lastClientX = event.clientX;
            },
            // Allow the header to be the drop target, and reassign when needed
            dragover: (event: DragEvent) => {
              event.preventDefault();
              // Don't swap with our last column
              if (
                targetColumn?.key === column.key &&
                !isDraggingAwayFromDraggedColumn(event)
              ) {
                lastClientX = event.clientX;
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

              lastClientX = event.clientX;
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
        [column.key, sortIcon]
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
      if (event.clientX > lastClientX) {
        return targetColumnOrder > draggedColumnOrder;
      }

      // Dragging left
      if (lastClientX > event.clientX) {
        return draggedColumnOrder > targetColumnOrder;
      }

      // Not moved
      if (lastClientX === event.clientX) {
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
