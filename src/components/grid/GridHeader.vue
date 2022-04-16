<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridManager } from "@/components/grid/GridManager";
import {
  defineComponent,
  inject,
  h,
  computed,
  watch,
  ref,
} from "@vue/composition-api";
import { VNode } from "vue";
import { VIcon } from "vuetify/lib/components";
import { debounce } from "lodash";
import { useColumnOrderEvents } from "@/components/grid/events/ColumnOrderEvents";
import { GridState } from "@/components/grid/GridState";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { SelectColumn } from "@/components/grid/columns/select/SelectColumn";

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
      inject<GridConfiguration<any>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;
    const scrollableDiv = ref<HTMLElement | null>(null);

    // Drag vars
    const { dragStart, drag, dragEnd, showDragging } = useColumnOrderEvents(
      gridState,
      gridConfiguration,
      "horizontal"
    );
    let isResizing = ref(false);
    let lastResizeX = 0;

    // How wide should our header row should be to align with the grid
    const totalGridWidth = computed(() =>
      gridConfiguration.columns.reduce(
        (totalWidth, column) =>
          totalWidth + gridState.columnStates[column.key].width,
        0
      )
    );

    // ONLY USE IN CONTEXT OF RENDERING
    const buildHeaderRow = () => {
      const { left, centre, right } = gridManager.columns;
      const { leftWidth, centreWidth, rightWidth } = gridManager.columnSizes;

      const leftCells: VNode[] = [];
      const centreCells: VNode[] = centre.map((column) => buildCell(column));
      const rightCells: VNode[] = [];

      left.forEach((column, index) => {
        leftCells.push(buildCell(column));
      });

      right.forEach((column, index) => {
        rightCells.push(buildCell(column));
      });

      return [
        h(
          "div",
          {
            class: "grid-column-wrapper",
            style: { width: leftWidth + "px", "min-width": leftWidth + "px" },
            attrs: {
              role: "row",
              "aria-rowindex": 1,
            },
          },
          leftCells
        ),
        h(
          "div",
          {
            ref: "scrollableDiv",
            class: "grid-column-cropper",
            attrs: {
              role: "presentation",
            },
          },
          [
            h(
              "div",
              {
                class: "grid-column-wrapper",
                style: {
                  width: centreWidth + "px",
                },
                attrs: {
                  role: "row",
                  "aria-rowindex": 1,
                },
              },
              centreCells
            ),
          ]
        ),
        h(
          "div",
          {
            class: "grid-column-wrapper",
            style: {
              width: rightWidth + "px",
              "min-width": rightWidth + "px",
              "margin-right": "17px",
            },
            attrs: {
              role: "row",
              "aria-rowindex": 1,
            },
          },
          rightCells
        ),
      ];
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn) => {
      const sortIcon = column.options.isSortable
        ? buildSortIcon(column)
        : undefined;

      const resizeBar = column.options.isManageable
        ? buildResizeBar(column)
        : undefined;

      const draggedColumnKey = gridState.columnDragged?.key ?? null;

      const isSelectColumn = column instanceof SelectColumn;
      const headerContent = isSelectColumn
        ? buildSelectCell(column)
        : column.key;

      return h(
        "div",
        {
          style: {
            width: gridState.columnStates[column.key].width + "px",
            "min-width": gridState.columnStates[column.key].width + "px",
            "justify-content": column.alignment,
          },
          attrs: {
            "col-key": column.key,
          },
          class: {
            "grid-header-cell": true,
            "grid-column-dragged": draggedColumnKey === column.key,
            "grid-header-no-hover": draggedColumnKey
              ? draggedColumnKey !== column.key
              : false,
          },
          on: {
            // Toggle our sorting behaviours
            click: () => {
              if (column.options.isSortable) {
                gridState.toggleSort(column);
              }

              if (column instanceof SelectColumn) {
                gridState.selectAllRows = !gridState.selectAllRows;
              }
            },
            // Set our drag type and data
            dragstart: (event: DragEvent) => dragStart(event, column),
            touchstart: (event: TouchEvent) => dragStart(event, column),
            // Allow the header to be the drop target, and reassign when needed
            drag: (event: DragEvent) => {
              // Don't allow moving when we are resizing
              if (isResizing.value) {
                return;
              }

              drag(event);
            },
            dragover: showDragging,
            touchmove: (event: TouchEvent) => {
              // Don't allow moving when we are resizing
              if (isResizing.value) {
                return;
              }

              drag(event);
            },
            dragend: dragEnd,
            touchend: dragEnd,
          },
          domProps: {
            draggable: column.options.isManageable,
          },
        },
        [headerContent, sortIcon, resizeBar]
      );
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
              document.querySelectorAll(
                `[col-key=${column.key}][role=gridcell]`
              )
            );
            // Largest size, plus the parent's padding, and extra for kindness
            const largestWidth = Math.max(
              ...relevantCells.map((cell) => {
                //const parentPadding = cell.parentElement.wid
                const parentStyle = window.getComputedStyle(
                  cell.parentElement!
                );

                // Strips out all non-number values
                const parentPaddingLeft = Number(
                  parentStyle.paddingLeft.replace(/\D/g, "")
                );
                const parentPaddingRight = Number(
                  parentStyle.paddingLeft.replace(/\D/g, "")
                );

                return (
                  cell.scrollWidth + parentPaddingLeft + parentPaddingRight + 1 // +1 so we aren't a tiny fraction off
                );
              })
            );
            gridState.columnStates[column.key].width = largestWidth;
          },
          // Initiate our drag
          dragstart: (event: DragEvent) => {
            isResizing.value = true;
            lastResizeX = event.clientX;

            // Hide ghost when resizing
            event.dataTransfer!.setDragImage(new Image(), 0, 0);
          },
          dragover: (event: DragEvent) => {
            event.preventDefault();
          },
          drag: debounce((event: DragEvent) => {
            // Don't resize if we shouldn't be, or if this is the last drag event
            if (!isResizing.value || !event.clientX) {
              return;
            }

            const resizeDelta = event.clientX - lastResizeX;
            const width = gridState.columnStates[column.key].width;
            gridState.columnStates[column.key].width = width + resizeDelta;
            lastResizeX = event.clientX;
          }),
          dragend: () => {
            isResizing.value = false;
          },
        },
      });
    };

    const buildSelectCell = (column: SelectColumn<any>) => {
      return h(column.renderer, {
        props: { value: gridState.selectAllRows, isHeaderRow: true },
      });
    };

    watch(
      () => props.gridOffsetLeft,
      () => {
        if (scrollableDiv.value) {
          scrollableDiv.value.scrollTo({ left: props.gridOffsetLeft });
        }
      }
    );

    return {
      buildHeaderRow,
      totalGridWidth,
      scrollableDiv,
      isResizing,
    };
  },
  render(): VNode {
    // Returns them has a group, inside their container
    return h(
      "div",
      {
        class: {
          "grid-header-container": true,
          "grid-resizing": this.isResizing,
        },
        style: {
          height: this.rowHeight + "px",
        },
        attrs: {
          role: "rowgroup",
        },
      },
      [this.buildHeaderRow()]
    );
  },
});
</script>
