<script lang="ts">
import GridRow from "@/components/grid/GridRow.vue";
import {
  defineComponent,
  h,
  PropType,
  computed,
  watch,
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
    gridOffsetLeft: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const scrollOffsetTop = ref(0);

    // Total height of all rows, used for scrolling
    const totalGridHeight = computed((): number => {
      return props.internalItems.length * props.rowHeight;
    });

    // How many rows have we scrolled passed (effectively the topmost id of visible rows)
    const rowsOffset = computed((): number => {
      return Math.floor(scrollOffsetTop.value / props.rowHeight);
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
    const buildRow = (item: any, index: number) => {
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
        },
      });
    };

    // Manages scroll events passthrough
    const gridScroll = (e: Event) => {
      scrollOffsetTop.value = (e.target as HTMLElement).scrollTop;
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
    };
  },
  render(): VNode {
    const { min, max } = this.rowIndexBoundaries;
    const rows: VNode[] = [];
    for (let i = min; i < max; i++) {
      rows.push(this.buildRow(this.internalItems[i], i));
    }

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
              height: this.totalGridHeight + "px",
              transform: `translateX(${-this.gridOffsetLeft + "px"}`,
            },
            attrs: {
              role: "grid",
            },
          },
          rows
        ),
      ]
    );
  },
});
</script>
