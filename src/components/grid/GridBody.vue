<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridManager } from "@/components/grid/GridManager";
import GridRow from "@/components/grid/GridRow.vue";
import { GridState } from "@/components/grid/GridState";
import {
  defineComponent,
  h,
  PropType,
  computed,
  watch,
  inject,
} from "@vue/composition-api";
import { VNode } from "vue";
export interface GridScrollEvent {
  gridOffsetTop: number;
  gridOffsetLeft: number;
}

/**
 * Container for all grid rows, handling scroll events, offsets, and rendering
 */
export default defineComponent({
  name: "GridBody",
  components: { GridRow },
  props: {
    internalItems: {
      type: Array as PropType<Record<string, any>[]>,
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
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;

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
      min: Math.max(0, rowsOffset.value),
      max: Math.min(
        props.internalItems.length,
        rowsOffset.value + maximumVisibleRows.value
      ),
    }));

    // ONLY USE IN CONTEXT OF RENDERING
    const buildRow = (item: any, index: number, columns: AnyGridColumn[]) => {
      return h(GridRow, {
        attrs: {
          role: "row",
        },
        class: {
          "grid-row": true,
          "grid-row-odd": index % 2,
        },
        style: {
          top: index * props.rowHeight + "px",
          height: props.rowHeight + "px",
        },
        props: {
          item,
          index,
          columns,
        },
      });
    };

    // Manages scroll events passthrough
    const gridScroll = (e: any) => {
      context.emit("update:scroll", {
        gridOffsetTop: e.target.scrollTop,
        gridOffsetLeft: e.target.scrollLeft,
      } as GridScrollEvent);
    };

    watch(
      () => props.internalItems,
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

    return {
      buildRow,
      gridScroll,
      rowsOffset,
      totalGridHeight,
      rowIndexBoundaries,
      gridManager,
      gridState,
    };
  },
  render(): VNode {
    const { min, max } = this.rowIndexBoundaries;
    const { left, centre, right } =
      this.gridManager.pinnedSortedAndVisibleColumns;
    const rows: VNode[] = [];

    const leftRows: VNode[] = [];
    const centreRows: VNode[] = [];
    const rightRows: VNode[] = [];

    for (let i = min; i < max; i++) {
      if (left.length)
        leftRows.push(this.buildRow(this.internalItems[i], i, left));

      if (centre.length)
        centreRows.push(this.buildRow(this.internalItems[i], i, centre));

      if (right.length)
        rightRows.push(this.buildRow(this.internalItems[i], i, right));
    }

    const leftWidth = left.reduce(
      (acc, column) => acc + this.gridState.columnStates[column.key].width,
      0
    );

    const centreWidth = centre.reduce(
      (acc, column) => acc + this.gridState.columnStates[column.key].width,
      0
    );

    const rightWidth = right.reduce(
      (acc, column) => acc + this.gridState.columnStates[column.key].width,
      0
    );

    return h(
      "div",
      {
        class: "grid-row-container",
        style: {
          height: this.gridHeight + "px",
        },
        on: {
          scroll: this.gridScroll,
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
          },
          leftRows
        ),
        h(
          "div",
          {
            class: "grid-row-cropper",
            style: {
              height: this.totalGridHeight + "px",
            },
          },
          [
            h(
              "div",
              {
                class: "grid-row-center-wrapper",
                style: {
                  height: this.totalGridHeight + "px",
                },
              },
              [
                h(
                  "div",
                  {
                    style: {
                      width: centreWidth + "px",
                      height: this.totalGridHeight + "px",
                    },
                    attrs: {
                      role: "grid",
                    },
                  },
                  centreRows
                ),
              ]
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
          },
          rightRows
        ),
      ]
    );
  },
});
</script>
