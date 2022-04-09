<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridManager } from "@/components/grid/GridManager";
import { AnyWithGridIndex, GridState } from "@/components/grid/GridState";
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
import { useColumnDragManager } from "@/components/grid/events/ColumnDragManager";

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
      inject<GridConfiguration<AnyWithGridIndex>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;
    const scrollableDiv = ref<HTMLElement | null>(null);

    // Drag vars
    const { dragStart, dragOver, dragEnd } = useColumnDragManager(
      gridState,
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
          },
          leftCells
        ),
        h(
          "div",
          {
            ref: "scrollableDiv",
            class: "grid-column-cropper",
          },
          [
            h(
              "div",
              {
                class: "grid-column-wrapper",
                style: {
                  width: centreWidth + "px",
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

      const resizeBar = buildResizeBar(column);

      return h(
        "div",
        {
          style: {
            width: gridState.columnStates[column.key].width + "px",
          },
          class: "grid-header-cell",
          on: {
            // Toggle our sorting behaviours
            click: () => {
              gridState.toggleSort(column);
            },
            // Set our drag type and data
            dragstart: (event: DragEvent) => dragStart(event, column),
            // Allow the header to be the drop target, and reassign when needed
            dragover: (event: DragEvent) => {
              // Don't allow moving when we are resizing
              if (isResizing.value) {
                return;
              }

              dragOver(event, column);
            },
            dragend: dragEnd,
          },
          domProps: {
            draggable: column.options.isDraggable,
          },
        },
        [column.key, sortIcon, resizeBar]
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
              document.querySelectorAll(`[col-key=${column.key}]`)
            );
            const largestWidth = Math.max(
              ...relevantCells.map((cell) => cell.clientWidth)
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
      gridState,
      gridManager,
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
      },
      [this.buildHeaderRow()]
    );
  },
});
</script>
