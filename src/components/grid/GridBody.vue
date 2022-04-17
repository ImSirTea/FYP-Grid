<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridManager } from "@/components/grid/GridManager";
import GridRow from "@/components/grid/GridBodyRow.vue";
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
import { VNode } from "vue";

/**
 * Container for all grid rows, handling scroll events, offsets, and rendering
 */
export default defineComponent({
  name: "GridBody",
  components: { GridRow },
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
      return h(GridRow, {
        attrs: {
          role: "row",
          "aria-rowindex": index + 1,
        },
        class: {
          "grid-row": true,
        },
        style: {
          top: index * props.rowHeight + "px",
          height: props.rowHeight + "px",
        },
        props: {
          item,
          columns,
          columnStartIndex,
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
        leftRows.push(
          this.buildRow(
            rowData,
            index + min,
            left.map((column) => column.definition),
            0
          )
        );
      }

      if (centre.length) {
        centreRows.push(
          this.buildRow(
            rowData,
            index + min,
            centre.map((column) => column.definition),
            left.length
          )
        );
      }

      if (right.length) {
        rightRows.push(
          this.buildRow(
            rowData,
            index + min,
            right.map((column) => column.definition),
            left.length + centre.length
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
