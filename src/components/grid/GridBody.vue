<script lang="ts">
import { Column } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import {
  defineComponent,
  h,
  PropType,
  computed,
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
  props: {
    internalItems: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
    rowHeight: {
      type: Number,
      required: false,
      default: 36,
    },
    gridHeight: {
      type: Number,
      required: false,
      default: 300,
    },
    bufferRows: {
      type: Number,
      required: false,
      default: 5,
    },
    gridOffsetTop: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const gridConfiguration =
      inject<GridConfiguration<any>>("gridConfiguration")!;

    // Total height of all rows, used for scrolling
    const totalGridHeight = computed((): string => {
      return props.internalItems.length * props.rowHeight + "px";
    });

    // How many rows have we scrolled passed
    const rowsOffset = computed((): number => {
      return Math.floor(props.gridOffsetTop / props.rowHeight);
    });

    // Maximum number of rows visible within the grid's height
    const maximumVisibleRows = computed((): number => {
      return Math.ceil(props.gridHeight / props.rowHeight) + props.bufferRows;
    });

    // Visible and offset grid row nodes
    const rows = computed((): VNode[] => {
      return props.internalItems
        .slice(
          Math.max(rowsOffset.value - props.bufferRows, 0),
          Math.min(
            rowsOffset.value + maximumVisibleRows.value + props.bufferRows,
            props.internalItems.length
          )
        )
        .map((item, idx) => buildRow(item, idx));
    });

    // ONLY USE IN CONTEXT OF RENDERING
    const buildRow = (item: any, idx: number) => {
      return h(
        "div",
        {
          class: {
            "grid-row": true,
            "grid-row-odd": (rowsOffset.value + idx) % 2,
          },
          style: {
            transform: `translateY(${idx * props.rowHeight + "px"})`,
            height: props.rowHeight + "px",
          },
        },
        gridConfiguration.columns.map((column) => buildCell(item, column))
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (item: any, column: Column<any, any>) => {
      return h(
        "div",
        {
          style: {
            width: column.widthWithUnit,
          },
          class: "grid-row-cell",
        },
        [h("span", {}, column.value(item))]
      );
    };

    // Manages scroll events passthrough
    const gridScroll = (e: any) => {
      // You could _potentially_ add a debounce here, but it might be a little jarring
      context.emit("update:scroll", {
        gridOffsetTop: e.target.scrollTop,
        gridOffsetLeft: e.target.scrollLeft,
      } as GridScrollEvent);
    };

    return {
      gridScroll,
      rowsOffset,
      rows,
      totalGridHeight,
    };
  },
  render(): VNode {
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
            class: "grid-row-height-wrapper",
            style: {
              height: this.totalGridHeight,
              "padding-top": this.rowsOffset * this.rowHeight + "px",
            },
          },
          this.rows
        ),
      ]
    );
  },
});
</script>
