<script lang="ts">
import GridRow from "@/components/grid/GridRow.vue";
import { defineComponent, h, PropType, computed } from "@vue/composition-api";
import { VNode } from "vue";
import { debounce } from "lodash";

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
      type: Array as PropType<any[]>,
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
      const viewportMax = Math.ceil(props.gridHeight / props.rowHeight);

      return Math.min(viewportMax, props.internalItems.length);
    });

    // Visible and offset grid row nodes
    const rows = computed((): VNode[] => {
      const min = Math.max(rowsOffset.value, 0);
      const max = Math.min(
        rowsOffset.value + maximumVisibleRows.value,
        props.internalItems.length
      );

      const rows: VNode[] = [];

      for (let i = min; i < max; i++) {
        rows.push(buildRow(props.internalItems[i], i));
      }

      return rows;
    });

    // ONLY USE IN CONTEXT OF RENDERING
    const buildRow = (item: any, index: number) => {
      return h(GridRow, {
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
            },
          },
          this.rows
        ),
      ]
    );
  },
});
</script>
