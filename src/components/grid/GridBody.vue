<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridManager } from "@/components/grid/GridManager";
import GridBodyRow from "@/components/grid/GridBodyRow.vue";
import {
  AnyWithRowIndex,
  GridState,
  rowIndex,
} from "@/components/grid/GridState";
import {
  defineComponent,
  h,
  PropType,
  computed,
  watch,
  inject,
  ref,
} from "@vue/composition-api";
import Vue, { VNode } from "vue";

/**
 * Container for all grid rows, handling scroll events, offsets, and rendering
 */
export default defineComponent({
  name: "GridBody",
  components: { GridBodyRow },
  props: {
    internalItems: {
      type: Array as PropType<AnyWithRowIndex[]>,
      required: true,
      default: () => [],
    },
    rowHeight: {
      type: Number,
      required: true,
    },
    gridHeight: {
      type: Number,
      required: true,
    },
    gridOffsetTop: {
      type: Number,
      required: true,
    },
    bufferRows: {
      type: Number,
      required: true,
    },
    gridOffsetLeft: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;
    const horizontalScrollableDiv = ref<HTMLElement | null>(null);
    const verticalScrollableDiv = ref<HTMLElement | null>(null);

    // Total height of all rows, used for scrolling
    const totalGridHeight = computed((): number => {
      return props.internalItems.length * props.rowHeight;
    });

    // How many rows have we scrolled passed (effectively the topmost id of visible rows)
    const rowsOffset = computed((): number => {
      return Math.floor(props.gridOffsetTop / props.rowHeight);
    });

    // Maximum number of rows visible within the grid's height
    const maximumVisibleRows = computed((): number => {
      const viewportMax = Math.ceil(props.gridHeight / props.rowHeight);

      return Math.min(viewportMax, props.internalItems.length);
    });

    // Row boundaries to build rows between, defaults to -1 so our watcher can compute them correctly in a single place
    const rowIndexBoundaries = computed((): { min: number; max: number } => ({
      min: Math.max(0, rowsOffset.value - props.bufferRows),
      max: Math.min(
        props.internalItems.length,
        rowsOffset.value + maximumVisibleRows.value + props.bufferRows
      ),
    }));

    // ONLY USE IN CONTEXT OF RENDERING
    const buildRow = (
      item: AnyWithRowIndex,
      index: number,
      columns: AnyGridColumn[],
      columnStartIndex: number
    ) => {
      const top = index * props.rowHeight;
      return h(GridBodyRow, {
        attrs: {
          role: "row",
          "aria-rowindex": index + 1,
        },
        class: {
          "grid-row": true,
        },
        style: {
          top: top + "px",
          height: props.rowHeight + "px",
        },
        props: {
          item,
          columns,
          columnStartIndex,
        },
        on: {
          "focus:cell": (targetRowIndex: number, targetColumnIndex: number) => {
            // Our real row/column values
            const targetColumn =
              gridManager.visibleColumns[targetColumnIndex - 1];
            const targetRow = props.internalItems[targetRowIndex - 1];

            // If our row doesn't exist, don't bother, targetColumn already handles clipping
            if (!targetRow) {
              return;
            }

            const maxVisibleRowIndex =
              rowIndexBoundaries.value.max - props.bufferRows;

            const minVisibleRowIndex =
              rowIndexBoundaries.value.min + props.bufferRows;

            // If our new row is out of view at the bottom of the grid
            if (targetRowIndex > maxVisibleRowIndex) {
              context.emit(
                "update:scroll-top",
                props.gridOffsetTop +
                  (targetRowIndex - maxVisibleRowIndex) * props.rowHeight
              );
            }

            // If our new row is out of view at the top of the grid
            if (targetRowIndex - 1 < minVisibleRowIndex) {
              context.emit(
                "update:scroll-top",
                props.gridOffsetTop -
                  Math.abs(minVisibleRowIndex - targetRowIndex - 1) *
                    props.rowHeight
              );
            }

            // Once our scroll events have finished, focus our new cell
            Vue.nextTick(() => {
              // Focus our cell internally
              gridState.cellFocused = {
                rowId: targetRow[rowIndex],
                columnKey: targetColumn.key,
              };

              // And then focus the real cell
              let cellToTarget = document.querySelector(
                `[aria-rowindex="${targetRowIndex}"] > [aria-colindex="${targetColumnIndex}"]`
              ) as HTMLElement | null;

              cellToTarget?.focus();
            });
          },
        },
        nativeOn: {
          mouseenter: () => {
            gridState.rowHovered = item[rowIndex];
          },
          mouseleave: () => {
            gridState.rowHovered = null;
          },
        },
      });
    };

    // Manages scroll events passthrough
    const gridTopScroll = (e: Event) => {
      context.emit("update:scroll-top", (e.target as HTMLElement).scrollTop);
    };
    const gridLeftScroll = (e: Event) => {
      context.emit("update:scroll-left", (e.target as HTMLElement).scrollLeft);
    };

    watch(
      totalGridHeight,
      () => {
        // TODO: This should probably not be hard coded
        if (totalGridHeight.value > 33554400) {
          console.error(
            "Too many rows for the grid to process due to HTML pixel value maximums."
          );
        }
      },
      { immediate: true }
    );

    watch(
      () => props.gridOffsetLeft,
      () => {
        if (horizontalScrollableDiv.value) {
          horizontalScrollableDiv.value.scrollTo({
            left: props.gridOffsetLeft,
          });
        }
      }
    );

    watch(
      () => props.gridOffsetTop,
      () => {
        if (verticalScrollableDiv.value) {
          verticalScrollableDiv.value.scrollTo({
            top: props.gridOffsetTop,
          });
        }
      }
    );

    return {
      buildRow,
      gridTopScroll,
      gridLeftScroll,
      rowsOffset,
      totalGridHeight,
      rowIndexBoundaries,
      gridManager,
      horizontalScrollableDiv,
      verticalScrollableDiv,
    };
  },
  render(): VNode {
    const { min, max } = this.rowIndexBoundaries;
    const { left, centre, right } = this.gridManager.columns;
    const { leftWidth, centreWidth, rightWidth } = this.gridManager.columnSizes;

    const leftRows: VNode[] = [];
    const centreRows: VNode[] = [];
    const rightRows: VNode[] = [];

    this.internalItems.slice(min, max).forEach((rowData, index) => {
      if (left.length) {
        leftRows.push(this.buildRow(rowData, index + min, left, 1));
      }

      if (centre.length) {
        centreRows.push(
          this.buildRow(rowData, index + min, centre, left.length + 1)
        );
      }

      if (right.length) {
        rightRows.push(
          this.buildRow(
            rowData,
            index + min,
            right,
            left.length + centre.length + 1
          )
        );
      }
    });

    return h(
      "div",
      {
        ref: "verticalScrollableDiv",
        class: "grid-row-container",
        style: {
          height: this.gridHeight + "px",
        },
        on: {
          scroll: this.gridTopScroll,
        },
        attrs: {
          role: "presentation",
        },
      },
      [
        h(
          "div",
          {
            style: {
              height: this.totalGridHeight + "px",
              width: leftWidth + "px",
              "min-width": leftWidth + "px",
            },
            attrs: {
              role: "rowgroup",
            },
          },
          leftRows
        ),
        h(
          "div",
          {
            class: "grid-column-cropper",
            style: {
              height: this.totalGridHeight + "px",
              width: centreWidth + "px",
            },
            attrs: {
              role: "presentation",
            },
          },
          [
            h(
              "div",
              {
                ref: "horizontalScrollableDiv",
                class: "grid-row-center-wrapper",
                style: {
                  height: this.totalGridHeight + "px",
                },
                on: {
                  scroll: this.gridLeftScroll,
                },
                attrs: {
                  role: "rowgroup",
                },
              },
              centreRows
            ),
          ]
        ),
        h(
          "div",
          {
            style: {
              height: this.totalGridHeight + "px",
              width: rightWidth + "px",
              "min-width": rightWidth + "px",
            },
            attrs: {
              role: "rowgroup",
            },
          },
          rightRows
        ),
      ]
    );
  },
});
</script>
